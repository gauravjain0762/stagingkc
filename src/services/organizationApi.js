import { apiRequest } from './api';
import store from '../store';

const getAuthToken = () => store.getState().auth.user?.token;

// Create Organization
export async function createOrganization(data) {
  const token = getAuthToken();
  return apiRequest('/api/organizations', {
    method: 'POST',
    body: data,
    token,
  });
}

// Get all organizations (user's organizations)
export async function getOrganizations(params = {}) {
  const token = getAuthToken();
  const queryString = new URLSearchParams({
    page: params.page || 1,
    limit: params.limit || 10,
    ...(params.search && { search: params.search }),
  }).toString();

  return apiRequest(`/api/organizations?${queryString}`, {
    method: 'GET',
    token,
  });
}

// Get organization by ID
export async function getOrganizationById(organizationId) {
  const token = getAuthToken();
  return apiRequest(`/api/organizations/${organizationId}`, {
    method: 'GET',
    token,
  });
}

// Get organization members
export async function getOrganizationMembers(organizationId, params = {}) {
  const token = getAuthToken();
  const queryString = new URLSearchParams({
    page: params.page || 1,
    limit: params.limit || 10,
  }).toString();

  return apiRequest(`/api/organizations/${organizationId}/members?${queryString}`, {
    method: 'GET',
    token,
  });
}

// Upload organization logo/cover image
export async function uploadOrganizationImage(file, type = 'logo') {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type); // 'logo' or 'coverImage'

  return apiRequest('/api/organizations/upload', {
    method: 'POST',
    body: formData,
    token,
    isFormData: true,
  });
}
