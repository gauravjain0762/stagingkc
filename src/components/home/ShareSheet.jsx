import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConnections } from '../../store/slices/profileSlice';
import { sendMessage, startDM } from '../../store/slices/messagesSlice';
import { showToast } from '../../store/slices/toastSlice';

/* Brand marks — inline so the sheet has no icon-font/CDN dependency. */
function WhatsAppIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.48-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35M12.04 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.38 9.38 0 0 1-1.44-5.01c0-5.18 4.22-9.4 9.42-9.4a9.35 9.35 0 0 1 6.65 2.76 9.32 9.32 0 0 1 2.75 6.65c0 5.18-4.22 9.4-9.41 9.4M20.52 3.45A11.7 11.7 0 0 0 12.04 0C5.56 0 .29 5.27.28 11.74c0 2.07.54 4.09 1.57 5.87L.18 24l6.53-1.71a11.74 11.74 0 0 0 5.33 1.36h.01c6.48 0 11.75-5.27 11.75-11.75 0-3.14-1.22-6.09-3.44-8.31"/></svg>;
}
function TelegramIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0m5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.061 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.441-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14a.5.5 0 0 1 .171.325c.016.093.036.306.02.472"/></svg>;
}
function XIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
}
function FacebookIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073"/></svg>;
}
function LinkedInIcon() {
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.06 2.06 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065m1.782 13.019H3.555V9h3.564zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/></svg>;
}
function MailIcon() {
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>;
}
function CopyIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
}
function CheckIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>;
}
function MoreIcon() {
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>;
}
function CloseIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>;
}
function PeopleIcon() {
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function BackIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
}

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

/**
 * Share sheet — for a post by default, or any other shareable item (e.g. an
 * event) by passing `title`/`text`/`heading` directly instead of `post`.
 *
 * `url` is a real, crawlable permalink — the server renders Open Graph tags
 * there so WhatsApp/Facebook/Telegram show a photo/caption preview. Every
 * target below is a plain link, so no SDKs and no third-party scripts.
 *
 * onShared() fires only when a share actually completes, so the share counter
 * doesn't increment when someone just opens and dismisses the sheet.
 */
export default function ShareSheet({ post, url, title, text, heading, onClose, onShared }) {
  const dispatch = useDispatch();
  const { connections, connectionsLoading } = useSelector(s => s.profile);

  const [copied, setCopied] = useState(false);
  const [view, setView] = useState('main'); // 'main' | 'friends'
  const [friendSearch, setFriendSearch] = useState('');
  const [selectedFriends, setSelectedFriends] = useState(() => new Set());
  const [sendingToFriends, setSendingToFriends] = useState(false);
  const copyTimer = useRef(null);
  const inputRef  = useRef(null);

  const authorName = post?.author?.fullName || post?.author?.name || 'Someone';
  const caption    = post?.caption?.trim() || '';
  const shareTitle = title ?? `Post by ${authorName}`;
  const shareText  = text ?? (caption ? `${authorName}: ${caption}` : `Check out this post by ${authorName}`);
  const sheetHeading = heading ?? 'Share post';

  const encUrl  = encodeURIComponent(url);
  const encText = encodeURIComponent(shareText);

  const targets = [
    { key: 'whatsapp', label: 'WhatsApp', Icon: WhatsAppIcon, cls: 'ss-whatsapp',
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${url}`)}` },
    { key: 'telegram', label: 'Telegram', Icon: TelegramIcon, cls: 'ss-telegram',
      href: `https://t.me/share/url?url=${encUrl}&text=${encText}` },
    { key: 'x', label: 'X', Icon: XIcon, cls: 'ss-x',
      href: `https://twitter.com/intent/tweet?url=${encUrl}&text=${encText}` },
    { key: 'facebook', label: 'Facebook', Icon: FacebookIcon, cls: 'ss-facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}` },
    { key: 'linkedin', label: 'LinkedIn', Icon: LinkedInIcon, cls: 'ss-linkedin',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}` },
    { key: 'email', label: 'Email', Icon: MailIcon, cls: 'ss-email',
      href: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${url}`)}` },
  ];

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimeout(copyTimer.current);
    };
  }, [onClose]);

  useEffect(() => {
    if (view === 'friends' && connections.length === 0 && !connectionsLoading) {
      dispatch(fetchConnections());
    }
  }, [view, connections.length, connectionsLoading, dispatch]);

  function toggleFriend(id) {
    setSelectedFriends(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleSendToFriends() {
    if (!selectedFriends.size || sendingToFriends) return;
    setSendingToFriends(true);
    try {
      const messageText = `${shareText}\n${url}`;
      await Promise.all([...selectedFriends].map(async (friendId) => {
        const conn = connections.find(c => c.id === friendId);
        let convId = conn?.conversationId;
        if (!convId) {
          const dmResult = await dispatch(startDM(friendId));
          if (!startDM.fulfilled.match(dmResult)) throw new Error(dmResult.payload || 'Failed to start conversation');
          convId = dmResult.payload.id;
        }
        const sendResult = await dispatch(sendMessage({ convId, type: 'text', text: messageText }));
        if (!sendMessage.fulfilled.match(sendResult)) throw new Error(sendResult.payload || 'Failed to send message');
      }));
      dispatch(showToast({
        message: `Post shared with ${selectedFriends.size} friend${selectedFriends.size > 1 ? 's' : ''}`,
        type: 'success',
      }));
      onShared?.();
      onClose();
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to share post', type: 'error' }));
    } finally {
      setSendingToFriends(false);
    }
  }

  const filteredFriends = friendSearch.trim()
    ? connections.filter(c => c.name?.toLowerCase().includes(friendSearch.trim().toLowerCase()))
    : connections;

  async function handleCopy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Older/insecure-context browsers have no async clipboard API.
        inputRef.current?.select();
        document.execCommand('copy');
      }
      setCopied(true);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
      onShared?.();
    } catch {
      inputRef.current?.select();
    }
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ title: shareTitle, text: shareText, url });
      onShared?.();
    } catch (err) {
      // Dismissing the OS sheet throws AbortError — not a real failure.
      if (err?.name !== 'AbortError') onShared?.();
    }
  }

  return (
    <div className="ss-backdrop" onClick={onClose}>
      <div className="ss-sheet" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={sheetHeading}>
        <div className="ss-head">
          <div className="ss-head-left">
            {view === 'friends' && (
              <button className="ss-back" onClick={() => setView('main')} aria-label="Back">
                <BackIcon />
              </button>
            )}
            <h3 className="ss-title">{view === 'friends' ? 'Send to friends' : sheetHeading}</h3>
          </div>
          <button className="ss-close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        {view === 'main' ? (
          <>
            <div className="ss-targets">
              <button className="ss-target" onClick={() => setView('friends')}>
                <span className="ss-icon ss-friends"><PeopleIcon /></span>
                <span className="ss-label">Friends</span>
              </button>

              {targets.map(({ key, label, Icon, cls, href }) => (
                <a
                  key={key}
                  className="ss-target"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onShared?.()}
                >
                  <span className={`ss-icon ${cls}`}><Icon /></span>
                  <span className="ss-label">{label}</span>
                </a>
              ))}

              {typeof navigator !== 'undefined' && navigator.share && (
                <button className="ss-target" onClick={handleNativeShare}>
                  <span className="ss-icon ss-more"><MoreIcon /></span>
                  <span className="ss-label">More</span>
                </button>
              )}
            </div>

            <div className="ss-link-row">
              <input ref={inputRef} className="ss-link" value={url} readOnly onFocus={e => e.target.select()} />
              <button className={`ss-copy${copied ? ' ss-copy--done' : ''}`} onClick={handleCopy}>
                {copied ? <CheckIcon /> : <CopyIcon />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </>
        ) : (
          <div className="ss-friends-picker">
            <div className="ss-friends-search">
              <input
                className="ss-friends-search-input"
                placeholder="Search friends"
                value={friendSearch}
                onChange={e => setFriendSearch(e.target.value)}
                autoFocus
              />
            </div>

            <div className="ss-friends-list">
              {connectionsLoading && connections.length === 0 && (
                <p className="ss-friends-empty">Loading friends…</p>
              )}
              {!connectionsLoading && filteredFriends.length === 0 && (
                <p className="ss-friends-empty">
                  {friendSearch ? `No friends found for "${friendSearch}"` : 'No Connections'}
                </p>
              )}
              {filteredFriends.map(conn => {
                const checked = selectedFriends.has(conn.id);
                return (
                  <label key={conn.id} className={`ss-friend-row${checked ? ' ss-friend-row--checked' : ''}`}>
                    <input
                      type="checkbox"
                      className="ss-friend-checkbox"
                      checked={checked}
                      onChange={() => toggleFriend(conn.id)}
                    />
                    {conn.avatar
                      ? <img src={conn.avatar} alt={conn.name} className="ss-friend-avatar" />
                      : <span className="ss-friend-avatar ss-friend-avatar--fallback">{initials(conn.name)}</span>
                    }
                    <span className="ss-friend-name">{conn.name}</span>
                  </label>
                );
              })}
            </div>

            <div className="ss-friends-footer">
              <button
                className="ss-friends-send"
                disabled={!selectedFriends.size || sendingToFriends}
                onClick={handleSendToFriends}
              >
                {sendingToFriends ? 'Sending…' : `Send${selectedFriends.size ? ` (${selectedFriends.size})` : ''}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
