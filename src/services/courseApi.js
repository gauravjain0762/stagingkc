const API_BASE_URL = 'https://kick-analyst-backend-production.jay886631.workers.dev';

const fetchWithAuth = async (url, token, options = {}) => {
  const headers = {
    ...options.headers,
  };

  if (token && !options.headers?.['Content-Type']?.includes('multipart')) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw data;
  }

  return data;
};

export const courseApi = {
  // Create course
  createCourse: async (data, token) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('level', data.level);
      formData.append('status', data.status);
      formData.append('price', data.price);
      if (data.coverImage) {
        formData.append('file', data.coverImage);
      }

      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`${API_BASE_URL}/api/courses`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw result;
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Get all courses
  getAllCourses: async (filter = 'all', category = null, token, page = 1, limit = 12) => {
    try {
      const params = new URLSearchParams({ filter, page, limit });
      if (category && category !== 'All Topics') {
        params.append('category', category.toLowerCase());
      }
      return await fetchWithAuth(`${API_BASE_URL}/api/courses?${params}`, token);
    } catch (error) {
      throw error;
    }
  },

  // Get course details
  getCourseDetails: async (courseId, token) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/api/courses/${courseId}`, token);
    } catch (error) {
      throw error;
    }
  },

  // Enroll in course
  enrollCourse: async (courseId, token) => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers,
      });

      const result = await response.json();
      if (!response.ok) throw result;
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Rate a course (1-5 stars, optional review). Only enrolled/purchased
  // users should be allowed to rate — backend must enforce this.
  rateCourse: async (courseId, rating, review, token) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };

      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/rate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ rating, review }),
      });

      const result = await response.json();
      if (!response.ok) throw result;
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Report a course to admin moderation (spam, inappropriate content, etc).
  reportCourse: async (courseId, reason, token) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };

      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/report`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason }),
      });

      const result = await response.json();
      if (!response.ok) throw result;
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Purchase a paid course (mock payment — no real gateway) and enroll in one step
  purchaseCourse: async (courseId, token) => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/purchase`, {
        method: 'POST',
        headers,
      });

      const result = await response.json();
      if (!response.ok) throw result;
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Update course progress
  updateCourseProgress: async (courseId, percentComplete, token) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };

      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/progress`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ percentComplete }),
      });

      const result = await response.json();
      if (!response.ok) throw result;
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Get the current user's chapter-level progress for a course
  getChapterProgress: async (courseId, token) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/api/courses/${courseId}/progress`, token);
    } catch (error) {
      throw error;
    }
  },

  // Mark one chapter complete for the current user
  completeChapter: async (courseId, chapterId, token) => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/chapters/${chapterId}/complete`, {
        method: 'POST',
        headers,
      });

      const result = await response.json();
      if (!response.ok) throw result;
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Get user enrolled courses
  getUserEnrolledCourses: async (userId, token) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/api/users/${userId}/courses/enrolled`, token);
    } catch (error) {
      throw error;
    }
  },

  // Get user created courses
  getUserCreatedCourses: async (userId, token) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/api/users/${userId}/courses/created`, token);
    } catch (error) {
      throw error;
    }
  },

  // Update course
  updateCourse: async (courseId, data, token) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('level', data.level);
      formData.append('status', data.status);
      formData.append('price', data.price);
      if (data.coverImage) {
        formData.append('file', data.coverImage);
      }

      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
        method: 'PUT',
        headers,
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw result;
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Publish course
  publishCourse: async (courseId, token) => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/publish`, {
        method: 'POST',
        headers,
      });

      const result = await response.json();
      if (!response.ok) throw result;
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Unpublish course
  unpublishCourse: async (courseId, token) => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/unpublish`, {
        method: 'POST',
        headers,
      });

      const result = await response.json();
      if (!response.ok) throw result;
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Delete course
  deleteCourse: async (courseId, token) => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
        method: 'DELETE',
        headers,
      });

      const result = await response.json();
      if (!response.ok) throw result;
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Get course chapters
  getChapters: async (courseId, token) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/api/courses/${courseId}/chapters`, token);
    } catch (error) {
      throw error;
    }
  },

  // Add a chapter (author only)
  addChapter: async (courseId, data, token) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description ?? '');
      formData.append('content', data.content);
      formData.append('order', data.order);
      formData.append('status', data.status ?? 'draft');
      formData.append('duration', data.duration ?? '');
      formData.append('learningObjectives', data.learningObjectives ?? '');
      formData.append('externalUrl', data.externalUrl ?? '');
      if (data.video) {
        formData.append('video', data.video);
      }
      if (data.pdf) {
        formData.append('pdf', data.pdf);
      }

      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/chapters`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw result;
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Update a chapter (author only)
  updateChapter: async (courseId, chapterId, data, token) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description ?? '');
      formData.append('content', data.content);
      formData.append('order', data.order);
      formData.append('status', data.status ?? 'draft');
      formData.append('duration', data.duration ?? '');
      formData.append('learningObjectives', data.learningObjectives ?? '');
      formData.append('externalUrl', data.externalUrl ?? '');
      if (data.video) {
        formData.append('video', data.video);
      }
      if (data.pdf) {
        formData.append('pdf', data.pdf);
      }

      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/chapters/${chapterId}`, {
        method: 'PUT',
        headers,
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw result;
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Delete a chapter (author only)
  deleteChapter: async (courseId, chapterId, token) => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/chapters/${chapterId}`, {
        method: 'DELETE',
        headers,
      });

      const result = await response.json();
      if (!response.ok) throw result;
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Get quizzes
  getQuizzes: async (userId, token) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/api/users/${userId}/quizzes`, token);
    } catch (error) {
      throw error;
    }
  },

  // Get quiz details
  getQuizDetails: async (quizId, token) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/api/quizzes/${quizId}`, token);
    } catch (error) {
      throw error;
    }
  },

  // Submit quiz
  submitQuiz: async (quizId, answers, token) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };

      const response = await fetch(`${API_BASE_URL}/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ answers }),
      });

      const result = await response.json();
      if (!response.ok) throw result;
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Get assignments
  getAssignments: async (userId, token) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/api/users/${userId}/assignments`, token);
    } catch (error) {
      throw error;
    }
  },

  // Submit assignment
  submitAssignment: async (assignmentId, data, token) => {
    try {
      const formData = new FormData();
      if (data.file) {
        formData.append('file', data.file);
      }
      if (data.submissionText) {
        formData.append('submissionText', data.submissionText);
      }

      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`${API_BASE_URL}/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw result;
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Get learning analytics
  getLearningAnalytics: async (userId, token) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/api/users/${userId}/learning-analytics`, token);
    } catch (error) {
      throw error;
    }
  },

  // Get dashboard stats
  getDashboardStats: async (userId, token) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/api/users/${userId}/dashboard-stats`, token);
    } catch (error) {
      throw error;
    }
  },

  // Get certificates
  getCertificates: async (userId, token) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/api/users/${userId}/certificates`, token);
    } catch (error) {
      throw error;
    }
  },

  // Download certificate
  downloadCertificate: async (certificateId, token) => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`${API_BASE_URL}/api/certificates/${certificateId}/download`, {
        headers,
      });

      if (!response.ok) throw new Error('Download failed');
      return await response.blob();
    } catch (error) {
      throw error;
    }
  },

  // Get discussions
  getDiscussions: async (courseId, token) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/api/courses/${courseId}/discussions`, token);
    } catch (error) {
      throw error;
    }
  },

  // Get discussion details
  getDiscussionDetails: async (discussionId, token) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/api/discussions/${discussionId}`, token);
    } catch (error) {
      throw error;
    }
  },

  // Post discussion
  postDiscussion: async (courseId, data, token) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };

      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/discussions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw result;
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Reply to discussion
  replyToDiscussion: async (discussionId, body, token) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };

      const response = await fetch(`${API_BASE_URL}/api/discussions/${discussionId}/replies`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ body }),
      });

      const result = await response.json();
      if (!response.ok) throw result;
      return result;
    } catch (error) {
      throw error;
    }
  },
};
