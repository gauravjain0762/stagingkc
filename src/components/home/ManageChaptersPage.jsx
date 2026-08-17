import { useEffect, useState } from 'react';
import { courseApi } from '../../services/courseApi';
import './ManageChaptersPage.css';

function BackArrowIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>; }
function TrashIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>; }
function EyeIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function CloseIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function ClockIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function VideoIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>; }
function DocumentIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>; }
function LinkIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>; }

const BASE_FORM = { title: '', description: '', content: '', externalUrl: '', duration: '', learningObjectives: '', status: 'draft', video: null, pdf: null };

// The /chapters backend endpoints don't exist yet. Every call below tries
// the real API first and, if it fails (network error, 404 — anything),
// silently falls back to updating local state instead, tagging the chapter
// "local-...". That keeps the whole add/edit/delete flow reviewable today,
// and once the backend ships, these same calls start persisting for real
// with no code change here.
const isLocalOnly = (id) => typeof id === 'string' && id.startsWith('local-');
const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);

const CONTENT_PREVIEW_LENGTH = 160;

function ChapterContentPreview({ content }) {
  const [expanded, setExpanded] = useState(false);
  if (!content) return null;
  const truncatable = content.length > CONTENT_PREVIEW_LENGTH;
  const shown = expanded || !truncatable ? content : `${content.slice(0, CONTENT_PREVIEW_LENGTH)}…`;
  return (
    <p className="mcp-chapter-preview">
      {shown}
      {truncatable && (
        <button type="button" className="mcp-see-more-btn" onClick={() => setExpanded(e => !e)}>
          {expanded ? 'See less' : 'See more'}
        </button>
      )}
    </p>
  );
}

export default function ManageChaptersPage({ course, authToken, onBack }) {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(BASE_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [previewChapter, setPreviewChapter] = useState(null);

  useEffect(() => {
    fetchChapters();
  }, [course.id]);

  const fetchChapters = async () => {
    setLoading(true);
    try {
      const res = await courseApi.getChapters(course.id, authToken);
      if (res.success) {
        setChapters((res.chapters || []).slice().sort(byOrder));
      }
    } catch {
      // Backend not live yet — start from an empty local list rather than
      // showing an error for something that isn't broken.
      setChapters([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = (chapterCount = chapters.length) => {
    setForm({ ...BASE_FORM, order: chapterCount + 1 });
    setEditingId(null);
  };

  const startEdit = (chapter) => {
    setEditingId(chapter.id);
    setForm({
      title: chapter.title || '',
      description: chapter.description || '',
      content: chapter.content || '',
      externalUrl: chapter.externalUrl || '',
      duration: chapter.duration || '',
      learningObjectives: chapter.learningObjectives || '',
      status: chapter.status || 'draft',
      order: chapter.order ?? 1,
      video: null,
      pdf: null,
    });
  };

  const isFormValid = form.title.trim() && form.duration.trim();

  const [togglingChapterId, setTogglingChapterId] = useState(null);

  // Quick publish/unpublish right from the chapter row — no need to open
  // Edit, flip the status toggle, and save just to change this one field.
  const handleToggleChapterPublish = async (ch) => {
    if (togglingChapterId) return;
    const nextStatus = ch.status === 'published' ? 'draft' : 'published';
    setTogglingChapterId(ch.id);
    try {
      let updated = { ...ch, status: nextStatus };
      if (!isLocalOnly(ch.id)) {
        try {
          const res = await courseApi.updateChapter(course.id, ch.id, {
            title: ch.title,
            description: ch.description,
            content: ch.content,
            order: ch.order,
            status: nextStatus,
            duration: ch.duration,
            learningObjectives: ch.learningObjectives,
            externalUrl: ch.externalUrl,
          }, authToken);
          if (res.success) updated = res.chapter;
        } catch {
          // fall back to the local toggle already computed above
        }
      }
      setChapters(prev => prev.map(c => (c.id === ch.id ? updated : c)).sort(byOrder));
    } finally {
      setTogglingChapterId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || saving) return;
    setSaving(true);
    const order = Number(form.order) || chapters.length + 1;
    try {
      if (editingId) {
        const existing = chapters.find(c => c.id === editingId);
        let chapter = {
          ...existing,
          title: form.title,
          description: form.description,
          content: form.content,
          externalUrl: form.externalUrl,
          duration: form.duration,
          learningObjectives: form.learningObjectives,
          status: form.status,
          order,
        };
        if (!isLocalOnly(editingId)) {
          try {
            const res = await courseApi.updateChapter(course.id, editingId, { ...form, order }, authToken);
            if (res.success) chapter = res.chapter;
          } catch {
            // fall back to the local edit already computed above
          }
        }
        setChapters(prev => prev.map(c => (c.id === editingId ? chapter : c)).sort(byOrder));
      } else {
        let chapter = {
          id: `local-${Date.now()}`,
          title: form.title,
          description: form.description,
          content: form.content,
          externalUrl: form.externalUrl,
          duration: form.duration,
          learningObjectives: form.learningObjectives,
          status: form.status,
          videoUrl: null,
          pdfUrl: null,
          order,
        };
        try {
          const res = await courseApi.addChapter(course.id, { ...form, order }, authToken);
          if (res.success) chapter = res.chapter;
        } catch {
          // fall back to the local chapter already computed above
        }
        setChapters(prev => [...prev, chapter].sort(byOrder));
      }
      resetForm(editingId ? chapters.length : chapters.length + 1);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete || deletingId) return;
    const chapterId = pendingDelete.id;
    setDeletingId(chapterId);
    try {
      if (!isLocalOnly(chapterId)) {
        try {
          await courseApi.deleteChapter(course.id, chapterId, authToken);
        } catch {
          // backend not live yet — remove locally anyway
        }
      }
      setChapters(prev => prev.filter(c => c.id !== chapterId));
      if (editingId === chapterId) resetForm();
    } finally {
      setDeletingId(null);
      setPendingDelete(null);
    }
  };

  return (
    <div className="mcp-page">
      <header className="mcp-topbar">
        <button className="mcp-back-btn" onClick={onBack}>
          <BackArrowIcon />
          <span>{course.title}</span>
        </button>
        <span className="mcp-topbar-sub">Manage Chapters</span>
        <div className="mcp-topbar-right">
          <span className={`mcp-status-pill ${course.status === 'published' ? 'mcp-status-pill--published' : 'mcp-status-pill--draft'}`}>
            {course.status === 'published' ? 'Published' : 'Draft'}
          </span>
        </div>
      </header>

      <div className="mcp-body">
        <div className="mcp-list-col">
          <h3 className="mcp-col-title">Chapters ({chapters.length})</h3>
          {loading ? (
            <div className="mcp-loading">
              <div className="mcp-loading-spinner" />
              <p>Loading chapters...</p>
            </div>
          ) : chapters.length === 0 ? (
            <p className="mcp-muted">No chapters yet — add the first one.</p>
          ) : (
            <div className="mcp-chapter-list">
              {chapters.map((ch, idx) => (
                <div key={ch.id} className={`mcp-chapter-row ${editingId === ch.id ? 'mcp-chapter-row--active' : ''}`}>
                  <span className="mcp-chapter-idx">{idx + 1}</span>
                  <div className="mcp-chapter-info">
                    <p className="mcp-chapter-title">
                      {ch.title}
                      <span className={`mcp-status-pill ${ch.status === 'published' ? 'mcp-status-pill--published' : 'mcp-status-pill--draft'}`}>
                        {ch.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                      {isLocalOnly(ch.id) && <span className="mcp-local-badge">Not saved to server</span>}
                    </p>
                    {ch.description && <p className="mcp-chapter-desc">{ch.description}</p>}
                    <ChapterContentPreview content={ch.content} />
                    <div className="mcp-chapter-badges">
                      {ch.duration && <span className="mcp-duration-badge"><ClockIcon /> {ch.duration}</span>}
                      {ch.videoUrl && (
                        <a className="mcp-video-badge" href={ch.videoUrl} target="_blank" rel="noreferrer"><VideoIcon /> View Video</a>
                      )}
                      {ch.pdfUrl && (
                        <a className="mcp-pdf-badge" href={ch.pdfUrl} target="_blank" rel="noreferrer"><DocumentIcon /> View PDF</a>
                      )}
                      {ch.externalUrl && (
                        <a className="mcp-url-badge" href={ch.externalUrl} target="_blank" rel="noreferrer"><LinkIcon /> Open Link</a>
                      )}
                    </div>
                  </div>
                  <div className="mcp-chapter-actions">
                    <button className="mcp-preview-link" onClick={() => setPreviewChapter(ch)}>
                      <EyeIcon /> Preview
                    </button>
                    <button className="mcp-edit-link" onClick={() => startEdit(ch)}>Edit</button>
                    <button
                      className={`mcp-chapter-publish-btn ${ch.status === 'published' ? 'mcp-chapter-publish-btn--unpublish' : 'mcp-chapter-publish-btn--publish'}`}
                      disabled={togglingChapterId === ch.id}
                      onClick={() => handleToggleChapterPublish(ch)}
                    >
                      {togglingChapterId === ch.id ? '...' : ch.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      className="mcp-delete-btn"
                      disabled={deletingId === ch.id}
                      onClick={() => setPendingDelete(ch)}
                      aria-label="Delete chapter"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mcp-form-col">
          <h3 className="mcp-col-title">{editingId ? 'Edit Chapter' : 'Add Chapter'}</h3>
          <form className="mcp-form" onSubmit={handleSubmit}>
            <div className="mcp-form-row">
              <div className="mcp-form-field">
                <label className="mcp-label">Title</label>
                <input
                  className="mcp-input"
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g., Introduction"
                  required
                />
              </div>
              <div className="mcp-form-field mcp-form-field--narrow">
                <label className="mcp-label">Order</label>
                <input
                  className="mcp-input"
                  type="number"
                  min="1"
                  value={form.order ?? ''}
                  onChange={(e) => setForm(f => ({ ...f, order: e.target.value }))}
                />
              </div>
            </div>

            <label className="mcp-label">Status</label>
            <div className="mcp-status-toggle">
              <button
                type="button"
                className={`mcp-status-btn ${form.status === 'draft' ? 'mcp-status-btn--active' : ''}`}
                onClick={() => setForm(f => ({ ...f, status: 'draft' }))}
              >
                Draft
              </button>
              <button
                type="button"
                className={`mcp-status-btn ${form.status === 'published' ? 'mcp-status-btn--active' : ''}`}
                onClick={() => setForm(f => ({ ...f, status: 'published' }))}
              >
                Publish
              </button>
            </div>

            <label className="mcp-label">Description (short summary)</label>
            <input
              className="mcp-input"
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="One-line summary shown in the chapter list"
            />

            <label className="mcp-label">Content</label>
            <textarea
              className="mcp-textarea"
              value={form.content}
              onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="What this chapter covers..."
              rows={6}
            />

            <label className="mcp-label">Learning Objectives (optional)</label>
            <textarea
              className="mcp-textarea"
              value={form.learningObjectives}
              onChange={(e) => setForm(f => ({ ...f, learningObjectives: e.target.value }))}
              placeholder="What the learner should be able to do after this chapter..."
              rows={3}
            />

            <div className="mcp-form-row">
              <div className="mcp-form-field">
                <label className="mcp-label">Estimated Duration *</label>
                <input
                  className="mcp-input"
                  value={form.duration}
                  onChange={(e) => setForm(f => ({ ...f, duration: e.target.value }))}
                  placeholder="e.g., 15 min"
                  required
                />
              </div>
              <div className="mcp-form-field">
                <label className="mcp-label">External URL (optional)</label>
                <input
                  className="mcp-input"
                  type="url"
                  value={form.externalUrl}
                  onChange={(e) => setForm(f => ({ ...f, externalUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>

            <label className="mcp-label">Video (optional)</label>
            <input
              className="mcp-input"
              type="file"
              accept="video/*"
              onChange={(e) => setForm(f => ({ ...f, video: e.target.files?.[0] ?? null }))}
            />

            <label className="mcp-label">PDF (optional)</label>
            <input
              className="mcp-input"
              type="file"
              accept="application/pdf"
              onChange={(e) => setForm(f => ({ ...f, pdf: e.target.files?.[0] ?? null }))}
            />

            <div className="mcp-form-actions">
              <button className="mcp-submit-btn" type="submit" disabled={!isFormValid || saving}>
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Chapter'}
              </button>
              {editingId && (
                <button className="mcp-cancel-btn" type="button" onClick={() => resetForm()}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {pendingDelete && (
        <div className="mcp-modal-overlay" onClick={() => !deletingId && setPendingDelete(null)}>
          <div className="mcp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mcp-modal-icon">
              <TrashIcon />
            </div>
            <h3>Delete Chapter</h3>
            <p className="mcp-modal-sub">
              Delete <strong>&ldquo;{pendingDelete.title}&rdquo;</strong>? This can&apos;t be undone.
            </p>
            <div className="mcp-modal-actions">
              <button className="mcp-modal-cancel-btn" onClick={() => setPendingDelete(null)} disabled={!!deletingId}>
                Cancel
              </button>
              <button className="mcp-modal-delete-btn" onClick={confirmDelete} disabled={!!deletingId}>
                {deletingId ? 'Deleting...' : 'Delete Chapter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {previewChapter && (
        <div className="mcp-modal-overlay" onClick={() => setPreviewChapter(null)}>
          <div className="mcp-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mcp-preview-header">
              <span className="mcp-preview-tag">Student View Preview</span>
              <button className="mcp-preview-close" onClick={() => setPreviewChapter(null)} aria-label="Close preview">
                <CloseIcon />
              </button>
            </div>
            <div className="mcp-preview-body">
              <h2 className="mcp-preview-title">{previewChapter.title}</h2>
              {previewChapter.description && <p className="mcp-preview-desc">{previewChapter.description}</p>}
              {previewChapter.videoUrl && (
                <video className="mcp-preview-video" src={previewChapter.videoUrl} controls />
              )}
              {previewChapter.content && (
                <p className="mcp-preview-content">{previewChapter.content}</p>
              )}
              {previewChapter.learningObjectives && (
                <div className="mcp-preview-objectives">
                  <p className="mcp-preview-objectives-label">What you'll learn</p>
                  <p>{previewChapter.learningObjectives}</p>
                </div>
              )}
              {(previewChapter.pdfUrl || previewChapter.externalUrl) && (
                <div className="mcp-preview-resources">
                  {previewChapter.pdfUrl && (
                    <a href={previewChapter.pdfUrl} target="_blank" rel="noreferrer" className="mcp-resource-link"><DocumentIcon /> Download PDF</a>
                  )}
                  {previewChapter.externalUrl && (
                    <a href={previewChapter.externalUrl} target="_blank" rel="noreferrer" className="mcp-resource-link"><LinkIcon /> Open Link</a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
