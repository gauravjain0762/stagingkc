import { useState, useRef, useId, useEffect } from 'react';
import WebsitePreview from './WebsitePreview';
import NavbarLogoEditor from './NavbarLogoEditor';
import FooterSocialEditor from './FooterSocialEditor';
import { SECTION_TYPES, createSection, createId, createStarterSections, SPACING_PRESETS, BUTTON_SHAPES } from './sectionTemplates';
import { siteUrl, displayUrl } from './miniSiteUtils';
import './SiteBuilderPage.css';

/* Icons */
function ArrowLeftIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
}
function EyeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function SaveIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
}
function PublishIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}
function PlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
}
function DuplicateIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="8" height="8"/><path d="M21 11V5a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2"/></svg>;
}
function CloseIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function DragHandleIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>;
}
function DesktopIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="13" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
}
function TabletIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
}
function MobileIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="2" width="10" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
}
function UploadIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
}
function SettingsIcon() {
  return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}
function CheckCircleIcon() {
  return <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
function CopyIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
}
function ChevronRightIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
}

/* ── Small reusable property-field components ── */
function TextField({ label, value, onChange, placeholder }) {
  return (
    <div className="sbp-property-group">
      <label className="sbp-property-label">{label}</label>
      <input
        type="text"
        className="sbp-property-input"
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// A URL field with a "jump to this section" shortcut — picking a section
// sets the link to `#<that section's real id>`, so it's guaranteed to match
// what WebsitePreview actually scrolls to. Free-text stays available for
// external links (or anyone who wants a raw #anchor for whatever reason).
function LinkField({ label, value, onChange, sections = [] }) {
  const matchedSection = sections.find((s) => `#${s.id}` === value);
  return (
    <div className="sbp-property-group">
      <label className="sbp-property-label">{label}</label>
      <select
        className="sbp-property-select"
        value={matchedSection ? value : '__custom__'}
        onChange={(e) => onChange(e.target.value === '__custom__' ? '' : e.target.value)}
      >
        <option value="__custom__">Custom / external URL…</option>
        {sections.map((s) => (
          <option key={s.id} value={`#${s.id}`}>Jump to: {s.name}</option>
        ))}
      </select>
      {!matchedSection && (
        <input
          type="text"
          className="sbp-property-input"
          value={value || ''}
          placeholder="https://... or #anchor"
          onChange={(e) => onChange(e.target.value)}
          style={{ marginTop: 6 }}
        />
      )}
    </div>
  );
}

const EMOJI_CHOICES = [
  '🎯', '🚀', '💡', '⭐', '✨', '🔥', '⚡', '🏆', '🎉', '❤️', '👍', '✅',
  '📷', '🎨', '🎬', '🎵', '🖼️', '📱', '💻', '⌚', '🖥️', '📡', '🔌', '🔒',
  '☕', '🍕', '🍔', '🥗', '🍰', '🍷', '🍪', '🧊', '🌱', '🍃', '🌍', '🌤️',
  '💪', '🏋️', '🧘', '🏃', '⚽', '🏀', '🎾', '🚴', '🏊', '🧗', '🩺', '💊',
  '🏠', '🏢', '🏨', '🚗', '✈️', '🚢', '📍', '🗺️', '🔧', '🛠️', '⚙️', '📐',
  '💼', '📊', '📈', '💰', '💳', '🎓', '📚', '✏️', '📝', '🗓️', '⏰', '📞',
  '✉️', '💬', '🔔', '🎁', '🛒', '🏷️', '🔍', '🔑', '🛡️', '🌟', '👑', '💎',
];

function EmojiField({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onOutside(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  return (
    <div className="sbp-property-group" ref={ref} style={{ position: 'relative' }}>
      <label className="sbp-property-label">{label}</label>
      <div className="sbp-emoji-input-row">
        <input
          type="text"
          className="sbp-property-input"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
        <button type="button" className="sbp-emoji-picker-btn" onClick={() => setOpen((o) => !o)} title="Pick an emoji">
          {value || '🙂'}
        </button>
      </div>
      {open && (
        <div className="sbp-emoji-picker-popover">
          {EMOJI_CHOICES.map((e) => (
            <button
              type="button"
              key={e}
              className="sbp-emoji-picker-option"
              onClick={() => { onChange(e); setOpen(false); }}
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TextAreaField({ label, value, onChange, rows = 3 }) {
  return (
    <div className="sbp-property-group">
      <label className="sbp-property-label">{label}</label>
      <textarea
        className="sbp-property-input sbp-property-textarea"
        rows={rows}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

const SWATCHES = ['#ffffff', '#f3f4f6', '#e5e7eb', '#1f2937', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

function ColorField({ label, value, onChange }) {
  return (
    <div className="sbp-property-group">
      <label className="sbp-property-label">{label}</label>
      <div className="sbp-color-picker">
        {SWATCHES.map((color) => (
          <button
            type="button"
            key={color}
            className={`sbp-color-option ${value === color ? 'sbp-color-option--active' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            title={color}
          />
        ))}
        <input
          type="color"
          className="sbp-color-custom"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#ffffff'}
          onChange={(e) => onChange(e.target.value)}
          title="Custom color"
        />
      </div>
    </div>
  );
}

function ImageField({ label, value, onChange }) {
  const id = useId();
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  return (
    <div className="sbp-property-group">
      {label && <label className="sbp-property-label">{label}</label>}
      <div className="sbp-image-field">
        {value ? (
          <div className="sbp-image-field-preview">
            <img src={value} alt="" />
            <button type="button" className="sbp-image-field-remove" onClick={() => onChange('')} title="Remove image">
              <CloseIcon />
            </button>
          </div>
        ) : (
          <label htmlFor={id} className="sbp-image-field-upload">
            <UploadIcon />
            <span>Upload image</span>
          </label>
        )}
        <input id={id} type="file" accept="image/*" className="sbp-image-field-input" onChange={handleFile} />
      </div>
    </div>
  );
}

function ItemsEditor({ items = [], onChange, renderItem, newItemFactory, addLabel = 'Add Item' }) {
  const updateItem = (index, patch) => onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  const removeItem = (index) => onChange(items.filter((_, i) => i !== index));
  const addItem = () => onChange([...items, newItemFactory()]);

  return (
    <div className="sbp-item-editor-list">
      {items.map((item, index) => (
        <div className="sbp-item-editor-row" key={index}>
          <div className="sbp-item-editor-row-header">
            <span>Item {index + 1}</span>
            <button type="button" className="sbp-section-action sbp-section-action--delete" onClick={() => removeItem(index)} title="Remove item">
              <TrashIcon />
            </button>
          </div>
          {renderItem(item, index, updateItem)}
        </div>
      ))}
      <button type="button" className="sbp-add-item-btn" onClick={addItem}>
        <PlusIcon /> {addLabel}
      </button>
    </div>
  );
}

export default function SiteBuilderPage({ siteId, onBack, site, onSiteUpdate }) {
  const [sections, setSections] = useState(() => (site?.sections?.length ? site.sections : createStarterSections()));
  const [selectedSectionId, setSelectedSectionId] = useState(() => sections[0]?.id ?? null);
  const [activePropTab, setActivePropTab] = useState('content');
  const [device, setDevice] = useState('desktop');
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [showProperties, setShowProperties] = useState(true);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [savedStatus, setSavedStatus] = useState('all-saved');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [publishedInfo, setPublishedInfo] = useState(null); // { name, url } | null
  const [linkCopied, setLinkCopied] = useState(false);

  const dragItem = useRef(null);
  const rowRefs = useRef([]);

  const mockSite = site || {
    id: siteId,
    name: 'My Portfolio',
    description: 'Professional portfolio showcase',
    slug: 'my-portfolio',
    status: 'draft',
    visibility: 'public',
    views: 0,
    lastEdited: 'just now',
    coverImage: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&q=80&fit=crop',
  };

  const selectedSection = sections.find((s) => s.id === selectedSectionId) || null;

  const updateSelectedSection = (patch) => {
    setSections((prev) => prev.map((s) => (s.id === selectedSectionId ? { ...s, ...patch } : s)));
  };
  const updateSelectedContent = (patch) => {
    setSections((prev) => prev.map((s) => (s.id === selectedSectionId ? { ...s, content: { ...s.content, ...patch } } : s)));
  };
  const updateSelectedStyle = (patch) => {
    setSections((prev) => prev.map((s) => (s.id === selectedSectionId ? { ...s, style: { ...s.style, ...patch } } : s)));
  };

  const handleTypeChange = (newType) => {
    const template = createSection(newType);
    setSections((prev) =>
      prev.map((s) => (s.id === selectedSectionId ? { ...s, type: newType, icon: template.icon, content: template.content } : s))
    );
  };

  const handleAddSection = (type) => {
    const newSection = createSection(type);
    setSections((prev) => [...prev, newSection]);
    setSelectedSectionId(newSection.id);
    setActivePropTab('content');
    setShowAddPicker(false);
  };

  const handleDeleteSection = (sectionId) => {
    setSections((prev) => {
      const filtered = prev.filter((s) => s.id !== sectionId);
      if (selectedSectionId === sectionId) {
        setSelectedSectionId(filtered[0]?.id ?? null);
      }
      return filtered;
    });
  };

  const handleDuplicateSection = (section) => {
    const copy = { ...section, id: createId(), name: `${section.name} (copy)` };
    setSections((prev) => {
      const index = prev.findIndex((s) => s.id === section.id);
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next;
    });
    setSelectedSectionId(copy.id);
  };

  const handleDragHandlePointerDown = (e, index) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    dragItem.current = index;
    setDraggingIndex(index);

    const onPointerMove = (moveEvent) => {
      if (dragItem.current === null) return;
      const y = moveEvent.clientY;
      const rows = rowRefs.current;
      let newIndex = dragItem.current;
      for (let i = 0; i < rows.length; i++) {
        const el = rows[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (y >= rect.top && y <= rect.bottom) {
          newIndex = i;
          break;
        }
      }
      if (newIndex !== dragItem.current) {
        const fromIndex = dragItem.current;
        setSections((prev) => {
          const next = [...prev];
          const [moved] = next.splice(fromIndex, 1);
          next.splice(newIndex, 0, moved);
          return next;
        });
        dragItem.current = newIndex;
        setDraggingIndex(newIndex);
      }
    };

    const onPointerUp = () => {
      dragItem.current = null;
      setDraggingIndex(null);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleSave = async () => {
    setSavedStatus('saving');
    try {
      // Demo mode: Save to localStorage instead of API
      await new Promise(resolve => setTimeout(resolve, 800));

      // Only store essential metadata, not large image data
      const updatedSite = {
        id: mockSite.id,
        name: mockSite.name,
        slug: mockSite.slug,
        status: mockSite.status,
        visibility: mockSite.visibility,
        sections: sections, // Include sections
        updatedAt: new Date().toISOString(),
        publishedAt: mockSite.publishedAt,
        views: mockSite.views || 0,
      };

      // Save to localStorage
      try {
        const sites = JSON.parse(localStorage.getItem('demoSites') || '[]');
        const siteIndex = sites.findIndex(s => s.id === mockSite.id);
        if (siteIndex >= 0) {
          sites[siteIndex] = updatedSite;
        } else {
          sites.push(updatedSite);
        }
        localStorage.setItem('demoSites', JSON.stringify(sites));
      } catch (storageErr) {
        // If storage fails, just show success anyway in demo mode
        console.warn('Storage quota exceeded, but demo continues');
      }

      setSavedStatus('all-saved');
      onSiteUpdate?.(mockSite.id, updatedSite);
      onBack?.();
    } catch (err) {
      setSavedStatus('all-saved');
      alert(err.message || 'Failed to save site');
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // Demo mode: Publish to localStorage
      setSavedStatus('saving');

      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 600));

      // Only store essential metadata, not large image data
      const updatedSite = {
        id: mockSite.id,
        name: mockSite.name,
        slug: mockSite.slug,
        status: 'live',
        visibility: mockSite.visibility,
        sections: sections, // Include sections so they display on published site
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: mockSite.views || 0,
      };

      // Save to localStorage
      try {
        const sites = JSON.parse(localStorage.getItem('demoSites') || '[]');
        const siteIndex = sites.findIndex(s => s.id === mockSite.id);
        if (siteIndex >= 0) {
          sites[siteIndex] = updatedSite;
        } else {
          sites.push(updatedSite);
        }
        localStorage.setItem('demoSites', JSON.stringify(sites));
      } catch (storageErr) {
        // If storage fails, just show success anyway in demo mode
        console.warn('Storage quota exceeded, but demo continues');
      }

      // Simulate publish
      await new Promise(resolve => setTimeout(resolve, 400));

      setSavedStatus('all-saved');
      onSiteUpdate?.(mockSite.id, updatedSite);
      setPublishedInfo({ name: updatedSite.name, url: siteUrl(updatedSite) });
    } catch (err) {
      setSavedStatus('all-saved');
      alert(err.message || 'Failed to publish site');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    setIsUnpublishing(true);
    try {
      // Demo mode: Unpublish using localStorage
      await new Promise(resolve => setTimeout(resolve, 600));

      const updatedSite = {
        id: mockSite.id,
        name: mockSite.name,
        slug: mockSite.slug,
        status: 'draft',
        visibility: mockSite.visibility,
        publishedAt: mockSite.publishedAt,
        updatedAt: new Date().toISOString(),
        views: mockSite.views || 0,
      };

      // Save to localStorage
      try {
        const sites = JSON.parse(localStorage.getItem('demoSites') || '[]');
        const siteIndex = sites.findIndex(s => s.id === mockSite.id);
        if (siteIndex >= 0) {
          sites[siteIndex] = updatedSite;
        }
        localStorage.setItem('demoSites', JSON.stringify(sites));
      } catch (storageErr) {
        // If storage fails, just show success anyway in demo mode
        console.warn('Storage quota exceeded, but demo continues');
      }

      onSiteUpdate?.(mockSite.id, updatedSite);
    } catch (err) {
      alert(err.message || 'Failed to unpublish site');
    } finally {
      setIsUnpublishing(false);
    }
  };

  function renderContentFields() {
    const c = selectedSection.content || {};
    const setContent = (patch) => updateSelectedContent(patch);

    switch (selectedSection.type) {
      case 'navbar':
        return (
          <>
            <TextField label="Logo / Brand Text" value={c.logoText} onChange={(v) => setContent({ logoText: v })} />
            <NavbarLogoEditor
              logo={c.logo}
              onChange={(logo) => setContent({ logo })}
            />
            <ItemsEditor
              items={c.links}
              onChange={(links) => setContent({ links })}
              addLabel="Add Link"
              newItemFactory={() => ({ label: 'New Link', url: '#' })}
              renderItem={(item, index, updateItem) => (
                <>
                  <TextField label="Label" value={item.label} onChange={(v) => updateItem(index, { label: v })} />
                  <LinkField label="Links to" value={item.url} onChange={(v) => updateItem(index, { url: v })} sections={sections} />
                </>
              )}
            />
            <TextField label="Secondary Button Text" value={c.secondaryCtaText} onChange={(v) => setContent({ secondaryCtaText: v })} />
            <LinkField label="Secondary Button Links to" value={c.secondaryCtaLink} onChange={(v) => setContent({ secondaryCtaLink: v })} sections={sections} />
            <TextField label="Primary Button Text" value={c.ctaText} onChange={(v) => setContent({ ctaText: v })} />
            <LinkField label="Primary Button Links to" value={c.ctaLink} onChange={(v) => setContent({ ctaLink: v })} sections={sections} />
          </>
        );

      case 'hero':
        return (
          <>
            <EmojiField label="Icon (emoji)" value={c.icon} onChange={(v) => setContent({ icon: v })} />
            <TextField label="Headline" value={c.headline} onChange={(v) => setContent({ headline: v })} />
            <TextAreaField label="Subheadline" rows={2} value={c.subheadline} onChange={(v) => setContent({ subheadline: v })} />
            <TextField label="Primary Button Text" value={c.primaryButtonText} onChange={(v) => setContent({ primaryButtonText: v })} />
            <LinkField label="Primary Button Links to" value={c.primaryButtonLink} onChange={(v) => setContent({ primaryButtonLink: v })} sections={sections} />
            <TextField label="Secondary Button Text" value={c.secondaryButtonText} onChange={(v) => setContent({ secondaryButtonText: v })} />
            <LinkField label="Secondary Button Links to" value={c.secondaryButtonLink} onChange={(v) => setContent({ secondaryButtonLink: v })} sections={sections} />
            <ImageField label="Hero Image" value={c.image} onChange={(v) => setContent({ image: v })} />
          </>
        );

      case 'text':
        return (
          <>
            <EmojiField label="Icon (emoji)" value={c.icon} onChange={(v) => setContent({ icon: v })} />
            <TextField label="Headline" value={c.headline} onChange={(v) => setContent({ headline: v })} />
            <TextAreaField label="Body" rows={5} value={c.body} onChange={(v) => setContent({ body: v })} />
          </>
        );

      case 'grid':
        return (
          <>
            <TextField label="Headline" value={c.headline} onChange={(v) => setContent({ headline: v })} />
            <ItemsEditor
              items={c.items}
              onChange={(items) => setContent({ items })}
              addLabel="Add Feature"
              newItemFactory={() => ({ icon: '✨', title: 'New Feature', description: 'Description' })}
              renderItem={(item, index, updateItem) => (
                <>
                  <EmojiField label="Icon (emoji)" value={item.icon} onChange={(v) => updateItem(index, { icon: v })} />
                  <TextField label="Title" value={item.title} onChange={(v) => updateItem(index, { title: v })} />
                  <TextAreaField label="Description" rows={2} value={item.description} onChange={(v) => updateItem(index, { description: v })} />
                </>
              )}
            />
          </>
        );

      case 'gallery':
        return (
          <>
            <TextField label="Headline" value={c.headline} onChange={(v) => setContent({ headline: v })} />
            <ItemsEditor
              items={c.items}
              onChange={(items) => setContent({ items })}
              addLabel="Add Image"
              newItemFactory={() => ({ image: '', caption: 'New Item' })}
              renderItem={(item, index, updateItem) => (
                <>
                  <ImageField label="Image" value={item.image} onChange={(v) => updateItem(index, { image: v })} />
                  <TextField label="Caption" value={item.caption} onChange={(v) => updateItem(index, { caption: v })} />
                </>
              )}
            />
          </>
        );

      case 'form':
        return (
          <>
            <TextField label="Headline" value={c.headline} onChange={(v) => setContent({ headline: v })} />
            <TextAreaField label="Subheadline" rows={2} value={c.subheadline} onChange={(v) => setContent({ subheadline: v })} />
            <ItemsEditor
              items={c.fields}
              onChange={(fields) => setContent({ fields })}
              addLabel="Add Field"
              newItemFactory={() => ({ label: 'New Field', type: 'text' })}
              renderItem={(item, index, updateItem) => (
                <>
                  <TextField label="Field Label" value={item.label} onChange={(v) => updateItem(index, { label: v })} />
                  <div className="sbp-property-group">
                    <label className="sbp-property-label">Field Type</label>
                    <select className="sbp-property-select" value={item.type} onChange={(e) => updateItem(index, { type: e.target.value })}>
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="textarea">Textarea</option>
                    </select>
                  </div>
                </>
              )}
            />
            <TextField label="Submit Button Text" value={c.submitButtonText} onChange={(v) => setContent({ submitButtonText: v })} />
          </>
        );

      case 'cta':
        return (
          <>
            <TextField label="Headline" value={c.headline} onChange={(v) => setContent({ headline: v })} />
            <TextAreaField label="Subheadline" rows={2} value={c.subheadline} onChange={(v) => setContent({ subheadline: v })} />
            <TextField label="Button Text" value={c.buttonText} onChange={(v) => setContent({ buttonText: v })} />
            <LinkField label="Button Links to" value={c.buttonLink} onChange={(v) => setContent({ buttonLink: v })} sections={sections} />
          </>
        );

      case 'testimonial':
        return (
          <>
            <TextField label="Headline" value={c.headline} onChange={(v) => setContent({ headline: v })} />
            <ItemsEditor
              items={c.items}
              onChange={(items) => setContent({ items })}
              addLabel="Add Testimonial"
              newItemFactory={() => ({ quote: 'New testimonial quote.', author: 'Customer Name', role: 'Role' })}
              renderItem={(item, index, updateItem) => (
                <>
                  <TextAreaField label="Quote" rows={2} value={item.quote} onChange={(v) => updateItem(index, { quote: v })} />
                  <TextField label="Author" value={item.author} onChange={(v) => updateItem(index, { author: v })} />
                  <TextField label="Role" value={item.role} onChange={(v) => updateItem(index, { role: v })} />
                </>
              )}
            />
          </>
        );

      case 'footer':
        return (
          <>
            <TextField label="Footer Text" value={c.text} onChange={(v) => setContent({ text: v })} />
            <FooterSocialEditor
              social={c.social}
              onChange={(social) => setContent({ social })}
            />
            <ItemsEditor
              items={c.links}
              onChange={(links) => setContent({ links })}
              addLabel="Add Link"
              newItemFactory={() => ({ label: 'New Link', url: '#' })}
              renderItem={(item, index, updateItem) => (
                <>
                  <TextField label="Label" value={item.label} onChange={(v) => updateItem(index, { label: v })} />
                  <LinkField label="Links to" value={item.url} onChange={(v) => updateItem(index, { url: v })} sections={sections} />
                </>
              )}
            />
          </>
        );

      default:
        return null;
    }
  }

  function renderStyleFields() {
    const style = selectedSection.style || {};
    const isDesktopVisible = selectedSection.visibleOnDesktop !== false;
    const isMobileVisible = selectedSection.visibleOnMobile !== false;

    return (
      <>
        <ColorField label="Background Color" value={style.background} onChange={(v) => updateSelectedStyle({ background: v })} />

        {selectedSection.type === 'form' && (
          <>
            <ColorField label="Form Field Background" value={style.formFieldBackground} onChange={(v) => updateSelectedStyle({ formFieldBackground: v })} />
            <ColorField label="Form Field Text Color" value={style.formFieldTextColor} onChange={(v) => updateSelectedStyle({ formFieldTextColor: v })} />
            <ColorField label="Placeholder Color" value={style.formPlaceholderColor} onChange={(v) => updateSelectedStyle({ formPlaceholderColor: v })} />
          </>
        )}

        <ImageField label="Background Image (optional)" value={style.backgroundImage} onChange={(v) => updateSelectedStyle({ backgroundImage: v })} />

        {style.backgroundImage && (
          <div className="sbp-property-group">
            <label className="sbp-property-label">Image Overlay Darkness</label>
            <input
              type="range"
              min="0"
              max="0.9"
              step="0.05"
              className="sbp-range-input"
              value={style.overlayOpacity ?? 0.4}
              onChange={(e) => updateSelectedStyle({ overlayOpacity: Number(e.target.value) })}
            />
            <span className="sbp-range-value">{Math.round((style.overlayOpacity ?? 0.4) * 100)}%</span>
          </div>
        )}

        <div className="sbp-property-row-2">
          <div className="sbp-property-group">
            <label className="sbp-property-label">Text Color</label>
            <input
              type="color"
              className="sbp-color-custom sbp-color-custom--block"
              value={/^#[0-9a-fA-F]{6}$/.test(style.textColor) ? style.textColor : '#1f2937'}
              onChange={(e) => updateSelectedStyle({ textColor: e.target.value })}
            />
          </div>
          <div className="sbp-property-group">
            <label className="sbp-property-label">Button / Accent</label>
            <input
              type="color"
              className="sbp-color-custom sbp-color-custom--block"
              value={/^#[0-9a-fA-F]{6}$/.test(style.accentColor) ? style.accentColor : '#3b82f6'}
              onChange={(e) => updateSelectedStyle({ accentColor: e.target.value })}
            />
          </div>
        </div>

        <div className="sbp-property-group">
          <label className="sbp-property-label">Spacing</label>
          <div className="sbp-toggle-group">
            {SPACING_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className={`sbp-toggle-btn ${style.paddingTop === preset.paddingTop && style.paddingBottom === preset.paddingBottom ? 'sbp-toggle-btn--active' : ''}`}
                onClick={() => updateSelectedStyle({ paddingTop: preset.paddingTop, paddingBottom: preset.paddingBottom })}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="sbp-property-group">
          <label className="sbp-property-label">Padding (custom)</label>
          <div className="sbp-property-input-group">
            <input
              type="number"
              placeholder="Top"
              className="sbp-property-input"
              value={style.paddingTop ?? 0}
              onChange={(e) => updateSelectedStyle({ paddingTop: Number(e.target.value) })}
            />
            <input
              type="number"
              placeholder="Bottom"
              className="sbp-property-input"
              value={style.paddingBottom ?? 0}
              onChange={(e) => updateSelectedStyle({ paddingBottom: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="sbp-property-group">
          <label className="sbp-property-label">Text Alignment</label>
          <div className="sbp-toggle-group">
            {['left', 'center', 'right'].map((a) => (
              <button
                key={a}
                type="button"
                className={`sbp-toggle-btn ${style.align === a ? 'sbp-toggle-btn--active' : ''}`}
                onClick={() => updateSelectedStyle({ align: a })}
              >
                {a.charAt(0).toUpperCase() + a.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="sbp-property-group">
          <label className="sbp-property-label">Section Width</label>
          <div className="sbp-toggle-group">
            <button
              type="button"
              className={`sbp-toggle-btn ${style.contentWidth !== 'boxed' ? 'sbp-toggle-btn--active' : ''}`}
              onClick={() => updateSelectedStyle({ contentWidth: 'full' })}
            >
              Full Width
            </button>
            <button
              type="button"
              className={`sbp-toggle-btn ${style.contentWidth === 'boxed' ? 'sbp-toggle-btn--active' : ''}`}
              onClick={() => updateSelectedStyle({ contentWidth: 'boxed' })}
            >
              Contained
            </button>
          </div>
        </div>

        <div className="sbp-property-group">
          <label className="sbp-property-label">Corner Radius</label>
          <input
            type="range"
            min="0"
            max="40"
            className="sbp-range-input"
            value={style.borderRadius ?? 0}
            onChange={(e) => updateSelectedStyle({ borderRadius: Number(e.target.value) })}
          />
          <span className="sbp-range-value">{style.borderRadius ?? 0}px</span>
        </div>

        <div className="sbp-property-group">
          <label className="sbp-property-label">Button Shape</label>
          <div className="sbp-toggle-group">
            {BUTTON_SHAPES.map((shape) => (
              <button
                key={shape.label}
                type="button"
                className={`sbp-toggle-btn ${(style.buttonRadius ?? 8) === shape.value ? 'sbp-toggle-btn--active' : ''}`}
                onClick={() => updateSelectedStyle({ buttonRadius: shape.value })}
              >
                {shape.label}
              </button>
            ))}
          </div>
        </div>

        <div className="sbp-property-divider"></div>

        <div className="sbp-property-group">
          <label className="sbp-property-label">Visibility</label>
          <div className="sbp-toggle-group">
            <button
              type="button"
              className={`sbp-toggle-btn ${isDesktopVisible ? 'sbp-toggle-btn--active' : ''}`}
              onClick={() => updateSelectedSection({ visibleOnDesktop: !isDesktopVisible })}
            >
              Desktop
            </button>
            <button
              type="button"
              className={`sbp-toggle-btn ${isMobileVisible ? 'sbp-toggle-btn--active' : ''}`}
              onClick={() => updateSelectedSection({ visibleOnMobile: !isMobileVisible })}
            >
              Mobile
            </button>
          </div>
        </div>

        <div className="sbp-property-group">
          <label className="sbp-property-label sbp-checkbox-label">
            <input
              type="checkbox"
              checked={isMobileVisible}
              onChange={(e) => updateSelectedSection({ visibleOnMobile: e.target.checked })}
            />
            Show on Mobile
          </label>
        </div>
      </>
    );
  }

  return (
    <div className="site-builder-page">
      {/* Header */}
      <div className="sbp-header">
        <div className="sbp-header-left">
          <button className="sbp-back-btn" onClick={onBack} title="Back to dashboard">
            <ArrowLeftIcon />
          </button>
          <div className="sbp-header-info">
            <h1 className="sbp-site-name">{mockSite.name}</h1>
            {mockSite.status === 'live' ? (
              <a href={siteUrl(mockSite)} target="_blank" rel="noopener noreferrer" className="sbp-site-url sbp-site-url--link" title="Open public link">
                {displayUrl(siteUrl(mockSite))}
              </a>
            ) : (
              <p className="sbp-site-url" title="Publish the site to make this link live">{displayUrl(siteUrl(mockSite))}</p>
            )}
          </div>
        </div>

        <div className="sbp-header-right">
          <div className={`sbp-save-status ${savedStatus}`}>
            {savedStatus === 'all-saved' && (
              <>
                <span className="sbp-status-dot"></span>
                <span className="sbp-status-text">All saved</span>
              </>
            )}
            {savedStatus === 'saving' && (
              <>
                <span className="sbp-status-dot sbp-status-dot--saving"></span>
                <span className="sbp-status-text">Saving...</span>
              </>
            )}
          </div>

          <button className="sbp-btn sbp-btn--preview" onClick={() => setShowFullPreview(true)} title="Full-screen preview">
            <EyeIcon />
            Preview
          </button>

          <button className="sbp-btn sbp-btn--save" onClick={handleSave} disabled={savedStatus === 'saving'} title={mockSite.status === 'live' ? 'Saves and updates the live site immediately' : 'Saves your progress without publishing'}>
            <SaveIcon />
            {savedStatus === 'saving' ? 'Saving...' : (mockSite.status === 'live' ? 'Save & Update Live Site' : 'Save Draft')}
          </button>

          {mockSite.status === 'live' ? (
            <button className="sbp-btn sbp-btn--publish" onClick={handleUnpublish} disabled={isUnpublishing}>
              <PublishIcon />
              {isUnpublishing ? 'Unpublishing...' : 'Unpublish'}
            </button>
          ) : (
            <button className="sbp-btn sbp-btn--publish" onClick={handlePublish} disabled={isPublishing}>
              <PublishIcon />
              {isPublishing ? 'Publishing...' : 'Publish'}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="sbp-content">
        {/* Left Sidebar - Site Structure */}
        <div className="sbp-sidebar sbp-sidebar--left sbp-sidebar--expanded">
          <div className="sbp-left-section">
            <h3 className="sbp-sidebar-title">Site Structure</h3>

            <div className="sbp-sections-list">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  ref={(el) => { rowRefs.current[index] = el; }}
                  className={[
                    'sbp-section-item',
                    selectedSectionId === section.id ? 'sbp-section-item--active' : '',
                    draggingIndex === index ? 'sbp-section-item--dragging' : '',
                  ].join(' ').trim()}
                  onClick={() => {
                    setSelectedSectionId(section.id);
                    setActivePropTab('content');
                  }}
                >
                  <span
                    className="sbp-drag-handle"
                    title="Drag to reorder"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      handleDragHandlePointerDown(e, index);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DragHandleIcon />
                  </span>
                  <span className="sbp-section-btn">
                    <span className="sbp-section-icon">{section.icon}</span>
                    <span className="sbp-section-label">{section.name}</span>
                  </span>
                  <div className="sbp-section-actions">
                    <button
                      className="sbp-section-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateSection(section);
                      }}
                      title="Duplicate section"
                    >
                      <DuplicateIcon />
                    </button>
                    <button
                      className="sbp-section-action sbp-section-action--delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSection(section.id);
                      }}
                      title="Delete section"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className="sbp-add-section-btn" onClick={() => setShowAddPicker(true)}>
              <PlusIcon />
              Add Section
            </button>
          </div>
        </div>

        {/* Center - Full Website Preview */}
        <div className="sbp-website-preview-container">
          <div className="sbp-preview-toolbar">
            <div className="sbp-device-switcher">
              <button className={`sbp-device-btn ${device === 'desktop' ? 'sbp-device-btn--active' : ''}`} onClick={() => setDevice('desktop')} title="Desktop">
                <DesktopIcon />
              </button>
              <button className={`sbp-device-btn ${device === 'tablet' ? 'sbp-device-btn--active' : ''}`} onClick={() => setDevice('tablet')} title="Tablet">
                <TabletIcon />
              </button>
              <button className={`sbp-device-btn ${device === 'mobile' ? 'sbp-device-btn--active' : ''}`} onClick={() => setDevice('mobile')} title="Mobile">
                <MobileIcon />
              </button>
            </div>
            {!showProperties && (
              <button
                className="sbp-show-properties-btn"
                onClick={() => setShowProperties(true)}
                title="Show properties panel"
              >
                <ChevronRightIcon /> Properties
              </button>
            )}
          </div>
          <WebsitePreview
            sections={sections}
            selectedSectionId={selectedSectionId}
            onSelectSection={(id) => {
              setSelectedSectionId(id);
              setActivePropTab('content');
            }}
            device={device}
            siteId={site._id}
            contactEmail={site.contactInfo?.email}
          />
        </div>

        {/* Right Sidebar - Properties */}
        <div className={`sbp-sidebar sbp-sidebar--right ${!showProperties ? 'sbp-sidebar--hidden' : ''}`}>
          <div className="sbp-left-section">
            <div className="sbp-sidebar-header">
              <h3 className="sbp-sidebar-title">Properties</h3>
              <button
                className="sbp-toggle-properties-btn"
                onClick={() => setShowProperties(!showProperties)}
                title={showProperties ? 'Hide properties' : 'Show properties'}
              >
                <ChevronRightIcon />
              </button>
            </div>

            {selectedSection ? (
              <div className="sbp-properties-panel">
                <TextField label="Section Name" value={selectedSection.name} onChange={(v) => updateSelectedSection({ name: v })} />

                <div className="sbp-property-group">
                  <label className="sbp-property-label">Section Type</label>
                  <select
                    className="sbp-property-select"
                    value={selectedSection.type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                  >
                    {SECTION_TYPES.map((t) => (
                      <option key={t.type} value={t.type}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="sbp-tabs-strip">
                  <button
                    className={`sbp-tab-btn ${activePropTab === 'content' ? 'sbp-tab-btn--active' : ''}`}
                    onClick={() => setActivePropTab('content')}
                  >
                    Content
                  </button>
                  <button
                    className={`sbp-tab-btn ${activePropTab === 'style' ? 'sbp-tab-btn--active' : ''}`}
                    onClick={() => setActivePropTab('style')}
                  >
                    Style
                  </button>
                </div>

                {activePropTab === 'content' ? renderContentFields() : renderStyleFields()}
              </div>
            ) : (
              <div className="sbp-no-properties">
                <SettingsIcon />
                <p>Select a section</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Section Picker */}
      {showAddPicker && (
        <div className="sbp-modal-overlay" onClick={() => setShowAddPicker(false)}>
          <div className="sbp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sbp-modal-header">
              <h3>Add Section</h3>
              <button className="sbp-modal-close" onClick={() => setShowAddPicker(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="sbp-type-grid">
              {SECTION_TYPES.map((t) => (
                <button key={t.type} className="sbp-type-card" onClick={() => handleAddSection(t.type)}>
                  <span className="sbp-type-card-icon">{t.icon}</span>
                  <span className="sbp-type-card-label">{t.label}</span>
                  <span className="sbp-type-card-desc">{t.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Publish Success */}
      {publishedInfo && (
        <div className="sbp-modal-overlay" onClick={() => { setPublishedInfo(null); setLinkCopied(false); }}>
          <div className="sbp-modal sbp-publish-modal" onClick={(e) => e.stopPropagation()}>
            <button className="sbp-modal-close sbp-publish-modal-close" onClick={() => { setPublishedInfo(null); setLinkCopied(false); }}>
              <CloseIcon />
            </button>
            <div className="sbp-publish-modal-icon"><CheckCircleIcon /></div>
            <h3 className="sbp-publish-modal-title">Published!</h3>
            <p className="sbp-publish-modal-sub">"{publishedInfo.name}" is now live.</p>
            <div className="sbp-publish-modal-link-row">
              <a href={publishedInfo.url} target="_blank" rel="noopener noreferrer" className="sbp-publish-modal-link">
                {publishedInfo.url}
              </a>
              <button
                type="button"
                className="sbp-publish-modal-copy"
                onClick={async () => {
                  await navigator.clipboard.writeText(publishedInfo.url);
                  setLinkCopied(true);
                  setTimeout(() => setLinkCopied(false), 2000);
                }}
                title="Copy link"
              >
                <CopyIcon /> {linkCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="sbp-publish-modal-actions">
              <a href={publishedInfo.url} target="_blank" rel="noopener noreferrer" className="sbp-btn sbp-btn--publish">
                <EyeIcon /> View Site
              </a>
              <button type="button" className="sbp-btn sbp-btn--save" onClick={() => { setPublishedInfo(null); setLinkCopied(false); onBack?.(); }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-screen Preview */}
      {showFullPreview && (
        <div className="sbp-fullpreview-overlay">
          <div className="sbp-fullpreview-header">
            <div className="sbp-fullpreview-title">
              {mockSite.name} <span>— Preview</span>
            </div>
            <div className="sbp-device-switcher">
              <button className={`sbp-device-btn ${device === 'desktop' ? 'sbp-device-btn--active' : ''}`} onClick={() => setDevice('desktop')} title="Desktop">
                <DesktopIcon />
              </button>
              <button className={`sbp-device-btn ${device === 'tablet' ? 'sbp-device-btn--active' : ''}`} onClick={() => setDevice('tablet')} title="Tablet">
                <TabletIcon />
              </button>
              <button className={`sbp-device-btn ${device === 'mobile' ? 'sbp-device-btn--active' : ''}`} onClick={() => setDevice('mobile')} title="Mobile">
                <MobileIcon />
              </button>
            </div>
            <button className="sbp-btn sbp-btn--save" onClick={() => setShowFullPreview(false)}>
              <CloseIcon /> Close Preview
            </button>
          </div>
          <div className="sbp-fullpreview-body">
            <WebsitePreview
              sections={sections}
              device={device}
              interactive={false}
              siteId={site._id}
              contactEmail={site.contactInfo?.email}
            />
          </div>
        </div>
      )}
    </div>
  );
}
