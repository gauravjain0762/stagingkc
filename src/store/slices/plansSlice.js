import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api';

// `justSelectedPlan` gates App.jsx showing OnboardingForm instead of HomePage
// — without persisting it, a hard refresh while still on the onboarding form
// resets this to false (fresh Redux store) and silently drops the user into
// the feed instead of keeping them on "Complete your profile". Mirrors it to
// localStorage the same way authSlice persists token/user, so a reload
// restores it exactly like any other session state.
const ONBOARDING_PENDING_KEY = 'onboarding_pending';

function saveOnboardingPending(value) {
  try { localStorage.setItem(ONBOARDING_PENDING_KEY, value ? '1' : ''); } catch (_) {}
}

export function clearOnboardingPending() {
  try { localStorage.removeItem(ONBOARDING_PENDING_KEY); } catch (_) {}
}

function loadOnboardingPending() {
  try { return localStorage.getItem(ONBOARDING_PENDING_KEY) === '1'; } catch (_) { return false; }
}

export const fetchPlans = createAsyncThunk(
  'plans/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiRequest('/api/auth/user/plans');
      return Array.isArray(data) ? data : (data.data ?? data.plans ?? []);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const selectPlan = createAsyncThunk(
  'plans/selectPlan',
  async (planId, { getState, rejectWithValue }) => {
    try {
      const { setupToken } = getState().auth;
      const data = await apiRequest('/api/auth/user/select-plan', {
        method: 'POST',
        body: { planId },
        token: setupToken,
      });
      const payload = data.data ?? data;
      return { planId, data: { token: payload.token ?? null, user: payload.user ?? null } };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Changing plan for an already-onboarded member is a different flow from
// selectPlan above (which only runs during signup, authenticated with the
// short-lived setupToken) — this needs the regular session token instead.
// Endpoint isn't confirmed against a real backend yet; treat a 404 as "not
// built yet" rather than a hard error so the Plans page still renders.
export const changePlan = createAsyncThunk(
  'plans/changePlan',
  async (planId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const data = await apiRequest('/api/users/me/plan', {
        method: 'POST',
        body: { planId },
        token,
      });
      return { planId, user: data?.data?.user ?? data?.user ?? null };
    } catch (err) {
      return rejectWithValue({ message: err.message, status: err.status, notBuilt: err.status === 404 });
    }
  }
);

export const fetchPlanHistory = createAsyncThunk(
  'plans/fetchPlanHistory',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const data = await apiRequest('/api/users/me/plan-history', { token });
      return Array.isArray(data) ? data : (data?.data ?? []);
    } catch (err) {
      return rejectWithValue({ message: err.message, status: err.status, notBuilt: err.status === 404 });
    }
  }
);

export const fetchBillingHistory = createAsyncThunk(
  'plans/fetchBillingHistory',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const data = await apiRequest('/api/users/me/billing-history', { token });
      return Array.isArray(data) ? data : (data?.data ?? []);
    } catch (err) {
      return rejectWithValue({ message: err.message, status: err.status, notBuilt: err.status === 404 });
    }
  }
);

const plansSlice = createSlice({
  name: 'plans',
  initialState: {
    plans: [],
    selectedPlanId: null,
    planSelectionComplete: false,
    // One-shot signal, separate from planSelectionComplete: that flag also
    // gates App.jsx's "does this user have a plan" check and must stay true
    // forever once set, so it can't be consumed. This one exists purely to
    // tell HomePage "you just landed here from plan selection" and is safe
    // to clear right after HomePage acts on it.
    justSelectedPlan: loadOnboardingPending(),
    loading: false,
    selecting: null,
    error: null,

    changingPlanId: null,
    changePlanError: null,
    changePlanNotBuilt: false,

    planHistory: [],
    planHistoryLoading: false,
    planHistoryNotBuilt: false,

    billingHistory: [],
    billingHistoryLoading: false,
    billingHistoryNotBuilt: false,
  },
  reducers: {
    clearPlansError(state) {
      state.error = null;
    },
    consumeJustSelectedPlan(state) {
      state.justSelectedPlan = false;
      clearOnboardingPending();
    },
    clearChangePlanError(state) {
      state.changePlanError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch plans ───────────────────────────
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Select plan ───────────────────────────
      .addCase(selectPlan.pending, (state, action) => {
        state.selecting = action.meta.arg;
        state.error = null;
      })
      .addCase(selectPlan.fulfilled, (state, action) => {
        state.selecting = null;
        state.selectedPlanId = action.payload.planId;
        state.planSelectionComplete = true;
        state.justSelectedPlan = true;
        saveOnboardingPending(true);
      })
      .addCase(selectPlan.rejected, (state, action) => {
        state.selecting = null;
        state.error = action.payload;
      })

      // ── Change plan (already-onboarded member) ──
      .addCase(changePlan.pending, (state, action) => {
        state.changingPlanId = action.meta.arg;
        state.changePlanError = null;
        state.changePlanNotBuilt = false;
      })
      .addCase(changePlan.fulfilled, (state) => {
        state.changingPlanId = null;
      })
      .addCase(changePlan.rejected, (state, action) => {
        state.changingPlanId = null;
        state.changePlanNotBuilt = !!action.payload?.notBuilt;
        state.changePlanError = action.payload?.notBuilt ? null : action.payload?.message;
      })

      // ── Plan history ───────────────────────────
      .addCase(fetchPlanHistory.pending, (state) => {
        state.planHistoryLoading = true;
        state.planHistoryNotBuilt = false;
      })
      .addCase(fetchPlanHistory.fulfilled, (state, action) => {
        state.planHistoryLoading = false;
        state.planHistory = action.payload;
      })
      .addCase(fetchPlanHistory.rejected, (state, action) => {
        state.planHistoryLoading = false;
        state.planHistoryNotBuilt = !!action.payload?.notBuilt;
      })

      // ── Billing history ─────────────────────────
      .addCase(fetchBillingHistory.pending, (state) => {
        state.billingHistoryLoading = true;
        state.billingHistoryNotBuilt = false;
      })
      .addCase(fetchBillingHistory.fulfilled, (state, action) => {
        state.billingHistoryLoading = false;
        state.billingHistory = action.payload;
      })
      .addCase(fetchBillingHistory.rejected, (state, action) => {
        state.billingHistoryLoading = false;
        state.billingHistoryNotBuilt = !!action.payload?.notBuilt;
      });
  },
});

export const { clearPlansError, consumeJustSelectedPlan, clearChangePlanError } = plansSlice.actions;
export default plansSlice.reducer;
