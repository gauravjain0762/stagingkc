import { apiRequest } from './api';
import store from '../store';

const getAuthToken = () => store.getState().auth.token;

// ============ MINI SITE CRUD ============

// Create Mini Site
export async function createMiniSite(organizationId, data) {
  const token = getAuthToken();
  return apiRequest(`/api/organizations/${organizationId}/mini-sites`, {
    method: 'POST',
    body: data,
    token,
  });
}

// Get Mini Site Details
export async function getMiniSite(organizationId, miniSiteId) {
  const token = getAuthToken();
  return apiRequest(`/api/organizations/${organizationId}/mini-sites/${miniSiteId}`, {
    method: 'GET',
    token,
  });
}

// Update Mini Site
export async function updateMiniSite(organizationId, miniSiteId, data) {
  const token = getAuthToken();
  return apiRequest(`/api/organizations/${organizationId}/mini-sites/${miniSiteId}`, {
    method: 'PATCH',
    body: data,
    token,
  });
}

// Delete Mini Site
export async function deleteMiniSite(organizationId, miniSiteId) {
  const token = getAuthToken();
  return apiRequest(`/api/organizations/${organizationId}/mini-sites/${miniSiteId}`, {
    method: 'DELETE',
    token,
  });
}

// ============ PUBLISH/UNPUBLISH ============

// Publish Mini Site
export async function publishMiniSite(organizationId, miniSiteId, message = '') {
  const token = getAuthToken();
  return apiRequest(`/api/organizations/${organizationId}/mini-sites/${miniSiteId}/publish`, {
    method: 'POST',
    body: { message },
    token,
  });
}

// Unpublish Mini Site
export async function unpublishMiniSite(organizationId, miniSiteId) {
  const token = getAuthToken();
  return apiRequest(`/api/organizations/${organizationId}/mini-sites/${miniSiteId}/unpublish`, {
    method: 'POST',
    body: {},
    token,
  });
}

// ============ SECTIONS MANAGEMENT ============

// Get All Sections
export async function getSections(organizationId, miniSiteId) {
  const token = getAuthToken();
  return apiRequest(`/api/organizations/${organizationId}/mini-sites/${miniSiteId}/sections`, {
    method: 'GET',
    token,
  });
}

// Add Section
export async function addSection(organizationId, miniSiteId, sectionData) {
  const token = getAuthToken();
  return apiRequest(`/api/organizations/${organizationId}/mini-sites/${miniSiteId}/sections`, {
    method: 'POST',
    body: sectionData,
    token,
  });
}

// Update Section
export async function updateSection(organizationId, miniSiteId, sectionId, sectionData) {
  const token = getAuthToken();
  return apiRequest(
    `/api/organizations/${organizationId}/mini-sites/${miniSiteId}/sections/${sectionId}`,
    {
      method: 'PATCH',
      body: sectionData,
      token,
    }
  );
}

// Delete Section
export async function deleteSection(organizationId, miniSiteId, sectionId) {
  const token = getAuthToken();
  return apiRequest(
    `/api/organizations/${organizationId}/mini-sites/${miniSiteId}/sections/${sectionId}`,
    {
      method: 'DELETE',
      token,
    }
  );
}

// Reorder Sections
export async function reorderSections(organizationId, miniSiteId, sections) {
  const token = getAuthToken();
  return apiRequest(
    `/api/organizations/${organizationId}/mini-sites/${miniSiteId}/sections/reorder`,
    {
      method: 'POST',
      body: { sections },
      token,
    }
  );
}
