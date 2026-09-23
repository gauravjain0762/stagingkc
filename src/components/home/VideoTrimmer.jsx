import { useState, useRef, useEffect } from 'react';
import './VideoTrimmer.css';

const MAX_TRIM_SECONDS = 90;

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

// Trims by actually re-playing [start,end] through captureStream() +
// MediaRecorder — no ffmpeg/server round-trip, but takes real time equal to
// the trimmed clip's length since it has to play through to capture it.
export default function VideoTrimmer({ file, onCancel, onSave }) {
  const videoRef = useRef(null);
  const [videoUrl] = useState(() => URL.createObjectURL(file));
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape' && !processing) onCancel(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel, processing]);

  function handleLoadedMetadata() {
    const d = videoRef.current?.duration || 0;
    setDuration(d);
    setEnd(Math.min(d, MAX_TRIM_SECONDS));
  }

  function handleStartChange(v) {
    const val = Math.max(0, Math.min(Number(v), end - 0.5));
    setStart(val);
    if (videoRef.current) videoRef.current.currentTime = val;
  }

  function handleEndChange(v) {
    const val = Math.min(duration, Math.max(Number(v), start + 0.5));
    setEnd(val);
  }

  async function handleTrim() {
    const video = videoRef.current;
    const captureStream = video?.captureStream || video?.mozCaptureStream;
    if (!video || !captureStream) {
      setError("Trimming isn't supported in this browser — using the original video.");
      onSave(file);
      return;
    }

    setProcessing(true);
    setError('');
    try {
      video.currentTime = start;
      await new Promise((resolve) => {
        function onSeeked() { video.removeEventListener('seeked', onSeeked); resolve(); }
        video.addEventListener('seeked', onSeeked);
      });

      const stream = captureStream.call(video);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      const stopped = new Promise((resolve) => { recorder.onstop = resolve; });

      recorder.start();
      await video.play();

      function watch() {
        if (video.currentTime >= end || video.ended) {
          video.pause();
          recorder.stop();
        } else {
          requestAnimationFrame(watch);
        }
      }
      requestAnimationFrame(watch);

      await stopped;
      const blob = new Blob(chunks, { type: 'video/webm' });
      const trimmedFile = new File([blob], `${file.name.replace(/\.\w+$/, '')}-trimmed.webm`, { type: 'video/webm' });
      onSave(trimmedFile);
    } catch (err) {
      console.warn('Video trim failed, falling back to original file:', err);
      onSave(file);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="vtrim-overlay" onClick={(e) => !processing && e.target === e.currentTarget && onCancel()}>
      <div className="vtrim-modal" role="dialog" aria-modal="true">
        <div className="vtrim-header">
          <h3 className="vtrim-title">Trim video</h3>
          <button className="vtrim-close-btn" onClick={onCancel} disabled={processing} aria-label="Cancel">✕</button>
        </div>

        <div className="vtrim-stage">
          <video ref={videoRef} src={videoUrl} onLoadedMetadata={handleLoadedMetadata} controls className="vtrim-video" />
        </div>

        {duration > 0 && (
          <div className="vtrim-controls">
            <div className="vtrim-range-row">
              <span className="vtrim-label">Start time</span>
              <input type="range" min={0} max={duration} step={0.1} value={start} onChange={(e) => handleStartChange(e.target.value)} className="vtrim-slider" disabled={processing} />
              <span className="vtrim-time">{formatTime(start)}</span>
            </div>
            <div className="vtrim-range-row">
              <span className="vtrim-label">End time</span>
              <input type="range" min={0} max={duration} step={0.1} value={end} onChange={(e) => handleEndChange(e.target.value)} className="vtrim-slider" disabled={processing} />
              <span className="vtrim-time">{formatTime(end)}</span>
            </div>
          </div>
        )}

        {error && <p className="vtrim-error">{error}</p>}

        <div className="vtrim-footer">
          <button className="vtrim-skip-btn" type="button" onClick={() => onSave(file)} disabled={processing}>Use original</button>
          <button className="vtrim-save-btn" type="button" onClick={handleTrim} disabled={processing || duration === 0}>
            {processing ? 'Trimming…' : 'Trim & Use'}
          </button>
        </div>
      </div>
    </div>
  );
}
