import store from '../store';
import { logout } from '../store/slices/authSlice';
import { showToast } from '../store/slices/toastSlice';
import { showLogin } from '../store/slices/uiSlice';
import { disconnectSocket } from './socket';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

let suspensionHandled = false;
let sessionExpiredHandled = false;

export async function apiRequest(path, { method = 'GET', body, token, isFormData = false } = {}) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: isFormData ? body : JSON.stringify(body) } : {}),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (data?.suspended && !suspensionHandled) {
      suspensionHandled = true;
      disconnectSocket();
      store.dispatch(logout());
      store.dispatch(showLogin());
      store.dispatch(showToast({
        message: data.message || 'Your account has been suspended. Please contact support.',
        type: 'error',
      }));
    }
    // TEMPORARILY DISABLED FOR DEBUGGING
    // else if ((res.status === 401 || res.status === 403) && !sessionExpiredHandled && token) {
    //   sessionExpiredHandled = true;
    //   disconnectSocket();
    //   store.dispatch(logout());
    //   store.dispatch(showLogin());
    //   store.dispatch(showToast({
    //     message: 'Your session has expired. Please login again.',
    //     type: 'error',
    //   }));
    // }
    const message =
      data?.message || data?.error || data?.msg || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  suspensionHandled = false;
  sessionExpiredHandled = false;
  return data;
}
