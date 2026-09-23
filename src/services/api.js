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

// Mini-Site Group Posts APIs
export async function createMiniSiteGroupPost(siteId, groupId, { caption, media, mediaFiles }, token) {
  // If mediaFiles (actual File objects) are provided, send FormData so backend can upload to Cloudinary
  if (mediaFiles && mediaFiles.length > 0) {
    const form = new FormData();
    form.append('caption', caption);
    Array.from(mediaFiles).forEach(file => form.append('media', file));
    return apiRequest(`/api/mini-sites/${siteId}/groups/${groupId}/posts`, {
      method: 'POST',
      token,
      body: form,
      isFormData: true
    });
  }
  // Fallback: send JSON with media URLs
  return apiRequest(`/api/mini-sites/${siteId}/groups/${groupId}/posts`, {
    method: 'POST',
    body: { caption, media },
    token
  });
}

export async function getMiniSiteGroupPosts(siteId, groupId, { page = 1, limit = 20 } = {}, token) {
  return apiRequest(`/api/mini-sites/${siteId}/groups/${groupId}/posts?page=${page}&limit=${limit}`, {
    token
  });
}

export async function likeMiniSiteGroupPost(siteId, groupId, postId, token) {
  return apiRequest(`/api/mini-sites/${siteId}/groups/${groupId}/posts/${postId}/like`, {
    method: 'POST',
    token
  });
}

export async function unlikeMiniSiteGroupPost(siteId, groupId, postId, token) {
  return apiRequest(`/api/mini-sites/${siteId}/groups/${groupId}/posts/${postId}/like`, {
    method: 'DELETE',
    token
  });
}

export async function createMiniSiteGroupComment(siteId, groupId, postId, { text, media }, token) {
  return apiRequest(`/api/mini-sites/${siteId}/groups/${groupId}/posts/${postId}/comments`, {
    method: 'POST',
    body: { text, media },
    token
  });
}

export async function getMiniSiteGroupComments(siteId, groupId, postId, { page = 1, limit = 10 } = {}, token) {
  return apiRequest(`/api/mini-sites/${siteId}/groups/${groupId}/posts/${postId}/comments?page=${page}&limit=${limit}`, {
    token
  });
}

export async function likeMiniSiteGroupComment(siteId, groupId, postId, commentId, token) {
  return apiRequest(`/api/mini-sites/${siteId}/groups/${groupId}/posts/${postId}/comments/${commentId}/like`, {
    method: 'POST',
    token
  });
}

export async function unlikeMiniSiteGroupComment(siteId, groupId, postId, commentId, token) {
  return apiRequest(`/api/mini-sites/${siteId}/groups/${groupId}/posts/${postId}/comments/${commentId}/like`, {
    method: 'DELETE',
    token
  });
}

export async function reportMiniSiteGroup(siteId, groupId, { reason }, token) {
  return apiRequest(`/api/mini-sites/${siteId}/groups/${groupId}/report`, {
    method: 'POST',
    body: { reason },
    token
  });
}

export async function updateMiniSiteGroupPost(siteId, groupId, postId, { caption }, token) {
  return apiRequest(`/api/mini-sites/${siteId}/groups/${groupId}/posts/${postId}`, {
    method: 'PUT',
    body: { caption },
    token
  });
}

export async function deleteMiniSiteGroupPost(siteId, groupId, postId, token) {
  return apiRequest(`/api/mini-sites/${siteId}/groups/${groupId}/posts/${postId}`, {
    method: 'DELETE',
    token
  });
}

export async function reportMiniSiteGroupPost(siteId, groupId, postId, { reason }, token) {
  return apiRequest(`/api/mini-sites/${siteId}/groups/${groupId}/posts/${postId}/report`, {
    method: 'POST',
    body: { reason },
    token
  });
}

// Mini-site Event APIs
export async function getMiniSiteEvents(siteId, { page = 1, limit = 20, search, category } = {}, token) {
  let url = `/api/mini-sites/${siteId}/events?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (category) url += `&category=${encodeURIComponent(category)}`;
  return apiRequest(url, { token });
}

export async function getMiniSiteEventDetail(siteId, eventId, token) {
  return apiRequest(`/api/mini-sites/${siteId}/events/${eventId}`, { token });
}

export async function getMiniSiteEventTickets(siteId, eventId, token) {
  return apiRequest(`/api/mini-sites/${siteId}/events/${eventId}/tickets`, { token });
}

export async function joinMiniSiteEvent(siteId, eventId, { ticketId, quantity, attendeeDetails }, token) {
  return apiRequest(`/api/mini-sites/${siteId}/events/${eventId}/join`, {
    method: 'POST',
    body: { ticketId, quantity, attendeeDetails },
    token
  });
}

export async function leaveMiniSiteEvent(siteId, eventId, token) {
  return apiRequest(`/api/mini-sites/${siteId}/events/${eventId}/leave`, {
    method: 'POST',
    token
  });
}

export async function getMiniSiteEventAttendees(siteId, eventId, { page = 1, limit = 50 } = {}, token) {
  return apiRequest(`/api/mini-sites/${siteId}/events/${eventId}/attendees?page=${page}&limit=${limit}`, { token });
}

// Mini-Site Event Discussion APIs
export async function createMiniSiteEventDiscussion(siteId, eventId, { caption, mediaFiles }, token) {
  if (mediaFiles && mediaFiles.length > 0) {
    const form = new FormData();
    form.append('caption', caption);
    Array.from(mediaFiles).forEach(file => form.append('media', file));
    return apiRequest(`/api/mini-sites/${siteId}/events/${eventId}/discussions`, {
      method: 'POST',
      token,
      body: form,
      isFormData: true
    });
  }
  return apiRequest(`/api/mini-sites/${siteId}/events/${eventId}/discussions`, {
    method: 'POST',
    body: { caption },
    token
  });
}

export async function getMiniSiteEventDiscussions(siteId, eventId, { page = 1, limit = 20 } = {}, token) {
  return apiRequest(`/api/mini-sites/${siteId}/events/${eventId}/discussions?page=${page}&limit=${limit}`, {
    token
  });
}

export async function deleteMiniSiteEventDiscussion(siteId, eventId, discussionId, token) {
  return apiRequest(`/api/mini-sites/${siteId}/events/${eventId}/discussions/${discussionId}`, {
    method: 'DELETE',
    token
  });
}
