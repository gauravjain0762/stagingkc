import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { selectPlan, clearOnboardingPending } from './plansSlice';
import { apiRequest } from '../../services/api';
import { showToast } from './toastSlice';

// Backend sends a plain { success:false, message } on a suspended-account
// login (no structured flag like the mid-session `suspended: true`) — detect
// it by status + message so we can surface the real "contact support" text
// instead of the generic "Invalid credentials" the login button shows.
function isSuspendedError(err) {
  return err.status === 403 && /suspended/i.test(err.message || '');
}

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      if (!token) return rejectWithValue('no token');
      const data = await apiRequest('/api/users/me/profile', { token });
      return data.user ?? data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const TOKEN_KEY = 'auth_token';
const USER_KEY  = 'auth_user';
const SESSION_EXPIRES_KEY = 'auth_session_expires_at';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

function saveSession(token, user) {
  try {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    let expiresAt = Number(localStorage.getItem(SESSION_EXPIRES_KEY));
    if (token !== savedToken || !Number.isFinite(expiresAt) || expiresAt <= 0) {
      expiresAt = Date.now() + SESSION_DURATION_MS;
    }
    localStorage.setItem(TOKEN_KEY, token ?? '');
    localStorage.setItem(USER_KEY, JSON.stringify(user ?? null));
    localStorage.setItem(SESSION_EXPIRES_KEY, String(expiresAt));
  } catch (_) {}
}

function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_EXPIRES_KEY);
  } catch (_) {}
}

function loadSession() {
  try {
    const token = localStorage.getItem(TOKEN_KEY) || null;
    const user  = JSON.parse(localStorage.getItem(USER_KEY)) || null;
    if (token && user) {
      let expiresAt = Number(localStorage.getItem(SESSION_EXPIRES_KEY));
      // Existing saved sessions predate the expiry setting; give them one
      // final 24-hour window, then enforce the fixed session lifetime.
      if (!Number.isFinite(expiresAt) || expiresAt <= 0) {
        expiresAt = Date.now() + SESSION_DURATION_MS;
        localStorage.setItem(SESSION_EXPIRES_KEY, String(expiresAt));
      }
      if (Date.now() >= expiresAt) {
        clearSession();
        return { token: null, user: null };
      }
    }
    return { token, user };
  } catch (_) {
    return { token: null, user: null };
  }
}

const { token: savedToken, user: savedUser } = loadSession();

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { dispatch, rejectWithValue }) => {
    try {
      const data = await apiRequest('/api/auth/user/login', {
        method: 'POST',
        body: { email, password },
      });
      const payload = data.data ?? data;
      // TEMP DIAGNOSTIC — remove after debugging the Vercel login issue.
      console.log('[LOGIN OK] raw response:', data);
      return { user: payload.user ?? null, token: payload.token ?? null };
    } catch (err) {
      // TEMP DIAGNOSTIC — shows exactly what the backend returned on failure.
      console.error('[LOGIN FAILED]', {
        status: err.status,
        message: err.message,
        data: err.data,
        requiresPlanSelection: err.data?.requiresPlanSelection,
      });
      // Backend returns this on a non-2xx status when the account exists but
      // never finished plan setup — route to PlansPage instead of showing
      // "invalid credentials" for what is actually a successful login.
      if (err.data?.requiresPlanSelection) {
        return rejectWithValue({
          requiresPlanSelection: true,
          setupToken: err.data.setupToken ?? null,
        });
      }
      if (isSuspendedError(err)) {
        dispatch(showToast({ message: err.message, type: 'error' }));
      }
      return rejectWithValue(err.message);
    }
  }
);

// Google Sign-In: `credential` is the ID token from Google Identity Services.
// Backend verifies it, finds/creates the user, and returns the same
// { user, token } shape as normal login (or requiresPlanSelection).
export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (credential, { dispatch, rejectWithValue }) => {
    try {
      const data = await apiRequest('/api/auth/google', {
        method: 'POST',
        body: { credential },
      });
      const payload = data.data ?? data;
      return { user: payload.user ?? null, token: payload.token ?? null };
    } catch (err) {
      if (err.data?.requiresPlanSelection) {
        return rejectWithValue({
          requiresPlanSelection: true,
          setupToken: err.data.setupToken ?? null,
        });
      }
      if (isSuspendedError(err)) {
        dispatch(showToast({ message: err.message, type: 'error' }));
      }
      return rejectWithValue(err.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials, { rejectWithValue }) => {
    try {
      await apiRequest('/api/auth/user/register', {
        method: 'POST',
        body: {
          fullName: credentials.fullName,
          email: credentials.email,
          password: credentials.password,
          dateOfBirth: credentials.dob,
          fcmToken: credentials.fcmToken ?? 'web_fcm_token',
        },
      });
      return { credentials };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (otp, { getState, rejectWithValue }) => {
    try {
      const { registrationData } = getState().auth;
      const data = await apiRequest('/api/auth/user/verify-otp', {
        method: 'POST',
        body: {
          fullName: registrationData?.fullName,
          email: registrationData?.email,
          password: registrationData?.password,
          dateOfBirth: registrationData?.dob,
          otp,
          fcmToken: registrationData?.fcmToken ?? 'web_fcm_token',
        },
      });
      const payload = data.data ?? data;
      return {
        setupToken: payload.setupToken ?? null,
        user: payload.user ?? null,
        token: payload.token ?? null,
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { registrationData } = getState().auth;
      await apiRequest('/api/auth/user/register', {
        method: 'POST',
        body: {
          fullName: registrationData?.fullName,
          email: registrationData?.email,
          password: registrationData?.password,
          dateOfBirth: registrationData?.dob,
          fcmToken: registrationData?.fcmToken ?? 'web_fcm_token',
        },
      });
      return {};
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: savedUser,
    token: savedToken,
    setupToken: null,
    isAuthenticated: !!(savedToken && savedUser),
    requiresPlanSelection: false,
    otpPending: false,
    registrationData: null,
    loading: false,
    resendLoading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearAuthState(state) {
      state.error = null;
      state.successMessage = null;
    },
    resetToSignup(state) {
      state.otpPending = false;
      state.registrationData = null;
      state.error = null;
      state.successMessage = null;
      state.loading = false;
    },
    logout(state) {
      clearSession();
      clearOnboardingPending();
      state.user = null;
      state.token = null;
      state.setupToken = null;
      state.isAuthenticated = false;
      state.requiresPlanSelection = false;
      state.otpPending = false;
      state.registrationData = null;
      state.error = null;
      state.successMessage = null;
    },
    // Sync update from socket follow_update / connection_count_update events
    updateFollowCounts(state, action) {
      if (!state.user) return;
      const { followerCount, followingCount } = action.payload;
      if (followerCount !== undefined) state.user.followerCount = followerCount;
      if (followingCount !== undefined) state.user.followingCount = followingCount;
      saveSession(state.token, state.user);
    },
    markProfileCompleted(state) {
      if (!state.user) return;
      state.user.profileCompleted = true;
      saveSession(state.token, state.user);
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Login ─────────────────────────────────
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.setupToken = null;
        saveSession(action.payload.token, action.payload.user);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        if (action.payload?.requiresPlanSelection) {
          state.requiresPlanSelection = true;
          state.setupToken = action.payload.setupToken;
          state.error = null;
        } else {
          state.error = action.payload;
        }
      })

      // ── Google Sign-In (same result path as login) ──
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        saveSession(action.payload.token, action.payload.user);
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        if (action.payload?.requiresPlanSelection) {
          state.requiresPlanSelection = true;
          state.setupToken = action.payload.setupToken;
          state.error = null;
        } else {
          state.error = action.payload;
        }
      })

      // ── Register ──────────────────────────────
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.otpPending = true;
        state.registrationData = action.payload.credentials;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Verify OTP ────────────────────────────
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.otpPending = false;
        state.registrationData = null;
        state.requiresPlanSelection = true;
        state.user = action.payload.user ?? null;
        state.setupToken = action.payload.setupToken ?? null;
        state.token = action.payload.token ?? null;
        state.successMessage = 'Email verified successfully!';
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Resend OTP ────────────────────────────
      .addCase(resendOtp.pending, (state) => {
        state.resendLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.resendLoading = false;
        state.successMessage = 'A new code has been sent to your email.';
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.resendLoading = false;
        state.error = action.payload;
      })

      // ── Fetch Me (resync on load / reconnect) ─
      .addCase(fetchMe.fulfilled, (state, action) => {
        if (!state.user) return;
        const d = action.payload;
        if (d.connectionCount !== undefined) state.user.connectionCount = d.connectionCount;
        if (d.postsCount     !== undefined) state.user.postsCount      = d.postsCount;
        if (d.followerCount  !== undefined) state.user.followerCount   = d.followerCount;
        if (d.followingCount !== undefined) state.user.followingCount  = d.followingCount;
        if (d.profileCompleted !== undefined) state.user.profileCompleted = d.profileCompleted;
        saveSession(state.token, state.user);
      })

      // ── Select Plan ───────────────────────────
      .addCase(selectPlan.fulfilled, (state, action) => {
        const { token, user } = action.payload.data ?? {};
        if (token) {
          state.token = token;
          state.isAuthenticated = true;
        }
        if (user) state.user = user;
        state.setupToken = null;
        state.requiresPlanSelection = false;
        saveSession(token ?? state.token, user ?? state.user);
      });
  },
});

export const { clearAuthState, resetToSignup, logout, updateFollowCounts, markProfileCompleted } = authSlice.actions;
export default authSlice.reducer;
