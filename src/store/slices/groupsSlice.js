import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api';

const VIDEO_EXT = /\.(mp4|webm|ogg|mov|avi|mkv)(\?|#|$)/i;

function detectMediaType(url = '', hint = null) {
  if (hint === 'video') return 'video';
  if (VIDEO_EXT.test(url)) return 'video';
  return 'image';
}

function normalizeGroupPost(p) {
  let rawMedia = [];
  if (Array.isArray(p.media) && p.media.length > 0) {
    rawMedia = p.media;
  } else {
    if (p.video) rawMedia.push({ url: p.video, type: 'video' });
    if (Array.isArray(p.videos)) p.videos.filter(Boolean).forEach(url => rawMedia.push({ url, type: 'video' }));
    if (Array.isArray(p.images)) p.images.filter(Boolean).forEach(url => rawMedia.push({ url }));
  }
  const media = rawMedia
    .filter(item => item?.url)
    .map(item => ({ ...item, type: detectMediaType(item.url, item.type) }));

  const commentCount = p.commentCount ?? p.commentsCount ?? (typeof p.comments === 'number' ? p.comments : (Array.isArray(p.comments) ? p.comments.length : 0));
  return {
    ...p,
    author: p.author ? { ...p.author, fullName: p.author.fullName ?? p.author.name ?? '' } : p.author,
    caption: p.caption ?? p.content ?? '',
    media,
    likes: Array.isArray(p.likes) ? p.likes : (typeof p.likes === 'number' ? p.likes : 0),
    likeCount: p.likeCount ?? (Array.isArray(p.likes) ? p.likes.length : (typeof p.likes === 'number' ? p.likes : 0)),
    liked: p.liked ?? false,
    commentCount,
    comments: typeof p.comments === 'number' ? new Array(p.comments).fill(null) : (Array.isArray(p.comments) ? p.comments : []),
    shares: typeof p.shares === 'number' ? new Array(p.shares).fill(null) : (Array.isArray(p.shares) ? p.shares : []),
  };
}

// 1. GET /api/groups
export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async ({ tab = 'suggested', category = '', search = '', page = 1, limit = 20 } = {}, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const params = new URLSearchParams({ tab, page, limit });
      if (category && category !== 'All') params.set('category', category);
      if (search) params.set('search', search);
      const data = await apiRequest(`/api/groups?${params}`, { token });
      // Handle multiple possible API response shapes
      let groups = [];
      if (Array.isArray(data)) {
        groups = data;
      } else if (data?.data?.groups && Array.isArray(data.data.groups)) {
        groups = data.data.groups;
      } else if (data?.groups && Array.isArray(data.groups)) {
        groups = data.groups;
      } else if (data?.items && Array.isArray(data.items)) {
        groups = data.items;
      } else if (data?.results && Array.isArray(data.results)) {
        groups = data.results;
      }
      const total = data?.data?.pagination?.total ?? data?.total ?? data?.count ?? data?.totalCount ?? groups.length;
      return { groups, total, tab };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 2. POST /api/groups
export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async ({ name, description, mission, category, privacy, adminApproval, minAge, coverImg, groupImg, inviteUserIds = [] }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const form = new FormData();
      form.append('name', name);
      if (description) form.append('description', description);
      if (mission) form.append('mission', mission);
      if (category) form.append('category', category);
      if (privacy) form.append('privacy', privacy);
      form.append('adminApproval', adminApproval ? 'true' : 'false');
      if (minAge) form.append('minAge', minAge);
      if (coverImg instanceof File) form.append('coverImg', coverImg);
      if (groupImg instanceof File) form.append('groupImg', groupImg);
      if (inviteUserIds.length) form.append('inviteUserIds', JSON.stringify(inviteUserIds));
      const data = await apiRequest('/api/groups', { method: 'POST', token, body: form, isFormData: true });
      return data.group ?? data;
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 3. GET /api/groups/:id
export const fetchGroupDetail = createAsyncThunk(
  'groups/fetchGroupDetail',
  async (groupId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const data = await apiRequest(`/api/groups/${groupId}`, { token });
      return data.group ?? data;
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 4. PUT /api/groups/:id
export const updateGroup = createAsyncThunk(
  'groups/updateGroup',
  async ({ groupId, name, description, mission, category, privacy, adminApproval, minAge, coverImg, groupImg }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const form = new FormData();
      if (name) form.append('name', name);
      if (description !== undefined) form.append('description', description);
      if (mission !== undefined) form.append('mission', mission);
      if (category) form.append('category', category);
      if (privacy) form.append('privacy', privacy);
      if (adminApproval !== undefined) form.append('adminApproval', adminApproval ? 'true' : 'false');
      if (minAge !== undefined) form.append('minAge', minAge);
      if (coverImg instanceof File) form.append('coverImg', coverImg);
      if (groupImg instanceof File) form.append('groupImg', groupImg);
      const data = await apiRequest(`/api/groups/${groupId}`, { method: 'PUT', token, body: form, isFormData: true });
      return data.group ?? data;
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 5. GET /api/groups/:id/posts
export const fetchGroupPosts = createAsyncThunk(
  'groups/fetchGroupPosts',
  async ({ groupId, page = 1, limit = 10 }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const data = await apiRequest(`/api/groups/${groupId}/posts?page=${page}&limit=${limit}`, { token });
      const posts = (data.posts ?? []).map(normalizeGroupPost);
      return { groupId, posts, total: data.total ?? 0, page };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 6. GET /api/groups/:id/members
export const fetchGroupMembers = createAsyncThunk(
  'groups/fetchGroupMembers',
  async ({ groupId, search = '', role = '', joinedYear = '', page = 1, limit = 50 }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const params = new URLSearchParams({ page, limit });
      if (search) params.set('search', search);
      if (role) params.set('role', role);
      if (joinedYear) params.set('joinedYear', joinedYear);
      const data = await apiRequest(`/api/groups/${groupId}/members?${params}`, { token });
      return { groupId, members: data.members ?? [], total: data.total ?? 0 };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 7. PUT /api/groups/:id/members/:memberId/role
export const changeMemberRole = createAsyncThunk(
  'groups/changeMemberRole',
  async ({ groupId, memberId, role }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const data = await apiRequest(`/api/groups/${groupId}/members/${memberId}/role`, { method: 'PUT', token, body: { role } });
      return { groupId, memberId, role: data.role ?? role };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 8. DELETE /api/groups/:id/members/:memberId
export const removeMember = createAsyncThunk(
  'groups/removeMember',
  async ({ groupId, memberId }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      await apiRequest(`/api/groups/${groupId}/members/${memberId}`, { method: 'DELETE', token });
      return { groupId, memberId };
    } catch (err) { return rejectWithValue({ groupId, memberId, message: err.message }); }
  }
);

// 8b. POST /api/groups/:id/members/:memberId/ban
export const banMember = createAsyncThunk(
  'groups/banMember',
  async ({ groupId, memberId }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const data = await apiRequest(`/api/groups/${groupId}/members/${memberId}/ban`, { method: 'POST', token });
      return { groupId, memberId, message: data.message };
    } catch (err) { return rejectWithValue({ groupId, memberId, message: err.message }); }
  }
);

// 9. POST /api/groups/:id/join
export const joinGroup = createAsyncThunk(
  'groups/joinGroup',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const groupId = typeof payload === 'string' ? payload : payload.groupId;
      const config = { method: 'POST', token };

      if (typeof payload === 'object' && payload.birthDate) {
        // Send birthDate as JSON body
        config.body = { birthDate: payload.birthDate };
      }

      const data = await apiRequest(`/api/groups/${groupId}/join`, config);
      return { groupId, joined: data.joined ?? true, pending: data.pending ?? false };
    } catch (err) {
      const groupId = typeof payload === 'string' ? payload : payload.groupId;
      return rejectWithValue({ groupId, message: err.message });
    }
  }
);

// 10. DELETE /api/groups/:id/leave
export const leaveGroup = createAsyncThunk(
  'groups/leaveGroup',
  async (groupId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      await apiRequest(`/api/groups/${groupId}/leave`, { method: 'DELETE', token });
      return { groupId };
    } catch (err) { return rejectWithValue({ groupId, message: err.message }); }
  }
);

// 11. POST /api/groups/:id/report
export const reportGroup = createAsyncThunk(
  'groups/reportGroup',
  async ({ groupId, reason }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      await apiRequest(`/api/groups/${groupId}/report`, { method: 'POST', token, body: { reason } });
      return { groupId };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 12. GET /api/groups/:id/pending
export const fetchPendingRequests = createAsyncThunk(
  'groups/fetchPendingRequests',
  async ({ groupId, search = '', mutual = '', requestedOn = '', page = 1, limit = 50 }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const params = new URLSearchParams({ page, limit });
      if (search) params.set('search', search);
      if (mutual) params.set('mutual', mutual);
      if (requestedOn) params.set('requestedOn', requestedOn);
      const data = await apiRequest(`/api/groups/${groupId}/pending?${params}`, { token });
      return { groupId, requests: data.requests ?? [], total: data.total ?? 0 };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 13. POST /api/groups/:id/pending/:requestId/accept
export const acceptGroupRequest = createAsyncThunk(
  'groups/acceptGroupRequest',
  async ({ groupId, requestId }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      await apiRequest(`/api/groups/${groupId}/pending/${requestId}/accept`, { method: 'POST', token });
      return { groupId, requestId };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 14. DELETE /api/groups/:id/pending/:requestId (reject)
export const rejectGroupRequest = createAsyncThunk(
  'groups/rejectGroupRequest',
  async ({ groupId, requestId }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      await apiRequest(`/api/groups/${groupId}/pending/${requestId}`, { method: 'DELETE', token });
      return { groupId, requestId };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 15. GET /api/groups/:id/admin
export const fetchAdminDashboard = createAsyncThunk(
  'groups/fetchAdminDashboard',
  async (groupId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const data = await apiRequest(`/api/groups/${groupId}/admin`, { token });
      return { groupId, group: data.group, stats: data.stats };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 16-b. POST /api/groups/:id/posts — create post in group
export const createGroupPost = createAsyncThunk(
  'groups/createGroupPost',
  async ({ groupId, caption, media = [] }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const form = new FormData();
      if (caption) form.append('caption', caption);
      Array.from(media).forEach(file => form.append('media', file));
      const data = await apiRequest(`/api/groups/${groupId}/posts`, { method: 'POST', token, body: form, isFormData: true });
      return { groupId, post: data.post ?? data };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 16. POST /api/users/:userId/friend-request
export const sendFriendRequest = createAsyncThunk(
  'groups/sendFriendRequest',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const data = await apiRequest(`/api/users/${userId}/friend-request`, { method: 'POST', token });
      return { userId, status: data.status };
    } catch (err) { return rejectWithValue({ userId, message: err.message }); }
  }
);

export const createAnnouncement = createAsyncThunk(
  'groups/createAnnouncement',
  async ({ groupId, text }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const data = await apiRequest(`/api/groups/${groupId}/announcements`, {
        method: 'POST',
        token,
        body: { text }
      });
      return { groupId, announcement: data.announcement || data };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

const groupsSlice = createSlice({
  name: 'groups',
  initialState: {
    groups: [],
    groupsTotal: 0,
    groupsLoading: false,
    groupsTab: '',
    groupsCat: '',
    groupPosts: {},
    groupPostsTotal: {},
    groupPostsLoading: false,
    groupMembers: {},
    groupMembersTotal: {},
    groupMembersLoading: false,
    pendingRequests: {},
    pendingTotal: {},
    pendingLoading: false,
    adminDashboard: {},
    adminLoading: false,
    creating: false,
    createError: null,
    joiningIds: [],
    leavingIds: [],
    friendRequestIds: [],
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchGroups.pending, (s, a) => {
        s.groupsLoading = true;
        s.error = null;
        // Clear groups immediately so displayGroups falls back to mock during loading
        s.groups = [];
        s.groupsTab = '';
        s.groupsCat = '';
      })
      .addCase(fetchGroups.fulfilled, (s, a) => {
        s.groupsLoading = false;
        s.groups = a.payload.groups;
        s.groupsTotal = a.payload.total;
        s.groupsTab = a.payload.tab;
      })
      .addCase(fetchGroups.rejected, (s, a) => {
        s.groupsLoading = false;
        s.error = a.payload;
        // groups stays [] → displayGroups will show HUB_GROUPS mock
      })

      .addCase(createGroup.pending, s => { s.creating = true; s.createError = null; })
      .addCase(createGroup.fulfilled, (s, a) => { s.creating = false; if (a.payload?._id) s.groups.unshift(a.payload); })
      .addCase(createGroup.rejected, (s, a) => { s.creating = false; s.createError = a.payload; })

      .addCase(updateGroup.fulfilled, (s, a) => {
        if (!a.payload?._id) return;
        const idx = s.groups.findIndex(g => g._id === a.payload._id);
        if (idx !== -1) s.groups[idx] = { ...s.groups[idx], ...a.payload };
      })

      .addCase(fetchGroupDetail.fulfilled, (s, a) => {
        if (!a.payload?._id) return;
        const idx = s.groups.findIndex(g => g._id === a.payload._id);
        if (idx !== -1) {
          s.groups[idx] = { ...s.groups[idx], ...a.payload };
          console.log('✅ Redux: Updated groups array with fetched detail:', { privacy: a.payload.privacy, minAge: a.payload.minAge });
        }
      })

      .addCase(fetchGroupPosts.pending, s => { s.groupPostsLoading = true; })
      .addCase(fetchGroupPosts.fulfilled, (s, a) => {
        const { groupId, posts, total, page } = a.payload;
        s.groupPostsLoading = false;
        s.groupPosts[groupId] = page === 1 ? posts : [...(s.groupPosts[groupId] ?? []), ...posts];
        s.groupPostsTotal[groupId] = total;
      })
      .addCase(fetchGroupPosts.rejected, s => { s.groupPostsLoading = false; })

      .addCase(fetchGroupMembers.pending, s => { s.groupMembersLoading = true; })
      .addCase(fetchGroupMembers.fulfilled, (s, a) => {
        const { groupId, members, total } = a.payload;
        s.groupMembersLoading = false;
        s.groupMembers[groupId] = members;
        s.groupMembersTotal[groupId] = total;
      })
      .addCase(fetchGroupMembers.rejected, s => { s.groupMembersLoading = false; })

      .addCase(changeMemberRole.fulfilled, (s, a) => {
        const { groupId, memberId, role } = a.payload;
        const member = (s.groupMembers[groupId] ?? []).find(m => (m._id ?? m.id) === memberId);
        if (member) member.role = role;
      })

      .addCase(removeMember.pending, (s, a) => {
        const { groupId, memberId } = a.meta.arg;
        if (s.groupMembers[groupId]) {
          s.groupMembers[groupId] = s.groupMembers[groupId].filter(m => (m._id ?? m.id) !== memberId);
        }
      })

      .addCase(joinGroup.pending, (s, a) => { if (!s.joiningIds.includes(a.meta.arg)) s.joiningIds.push(a.meta.arg); })
      .addCase(joinGroup.fulfilled, (s, a) => {
        const { groupId, joined, pending } = a.payload;
        s.joiningIds = s.joiningIds.filter(id => id !== groupId);
        const g = s.groups.find(g => (g._id ?? g.id) === groupId);
        if (g) { g.joined = joined; g.pending = pending; }
      })
      .addCase(joinGroup.rejected, (s, a) => { s.joiningIds = s.joiningIds.filter(id => id !== a.meta.arg); })

      .addCase(leaveGroup.pending, (s, a) => { if (!s.leavingIds.includes(a.meta.arg)) s.leavingIds.push(a.meta.arg); })
      .addCase(leaveGroup.fulfilled, (s, a) => {
        const { groupId } = a.payload;
        s.leavingIds = s.leavingIds.filter(id => id !== groupId);
        const g = s.groups.find(g => (g._id ?? g.id) === groupId);
        if (g) { g.joined = false; g.pending = false; }
      })
      .addCase(leaveGroup.rejected, (s, a) => { s.leavingIds = s.leavingIds.filter(id => id !== a.meta.arg); })

      .addCase(fetchPendingRequests.pending, s => { s.pendingLoading = true; })
      .addCase(fetchPendingRequests.fulfilled, (s, a) => {
        const { groupId, requests, total } = a.payload;
        s.pendingLoading = false;
        s.pendingRequests[groupId] = requests;
        s.pendingTotal[groupId] = total;
      })
      .addCase(fetchPendingRequests.rejected, s => { s.pendingLoading = false; })

      .addCase(acceptGroupRequest.pending, (s, a) => {
        const { groupId, requestId } = a.meta.arg;
        if (s.pendingRequests[groupId]) {
          s.pendingRequests[groupId] = s.pendingRequests[groupId].filter(r => (r._id ?? r.id) !== requestId);
          if (s.pendingTotal[groupId] > 0) s.pendingTotal[groupId] -= 1;
        }
      })

      .addCase(rejectGroupRequest.pending, (s, a) => {
        const { groupId, requestId } = a.meta.arg;
        if (s.pendingRequests[groupId]) {
          s.pendingRequests[groupId] = s.pendingRequests[groupId].filter(r => (r._id ?? r.id) !== requestId);
          if (s.pendingTotal[groupId] > 0) s.pendingTotal[groupId] -= 1;
        }
      })

      .addCase(fetchAdminDashboard.pending, s => { s.adminLoading = true; })
      .addCase(fetchAdminDashboard.fulfilled, (s, a) => {
        const { groupId, group, stats } = a.payload;
        s.adminLoading = false;
        s.adminDashboard[groupId] = { group, stats };
      })
      .addCase(fetchAdminDashboard.rejected, s => { s.adminLoading = false; })

      .addCase(createGroupPost.fulfilled, (s, a) => {
        const { groupId, post } = a.payload;
        const normalized = normalizeGroupPost(post);
        if (s.groupPosts[groupId]) s.groupPosts[groupId].unshift(normalized);
      })

      .addCase(sendFriendRequest.pending, (s, a) => {
        if (!s.friendRequestIds.includes(a.meta.arg)) s.friendRequestIds.push(a.meta.arg);
      })
      .addCase(sendFriendRequest.rejected, (s, a) => {
        const { userId, message } = a.payload ?? {};
        if (!/already sent/i.test(message ?? '')) {
          s.friendRequestIds = s.friendRequestIds.filter(id => id !== userId);
        }
      });
  },
});

export default groupsSlice.reducer;
