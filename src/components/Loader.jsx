// Single shared "Kink Catalyst" branded loader — used both as a full-page
// splash (default) and, via `inline`, as a smaller loader embedded inside a
// section/list/grid that keeps the rest of the page visible around it. No
// contextual subtitle by default — just the spinner and the brand mark.
export default function Loader({ subtitle = null, inline = false }) {
  return (
    <div className={`kc-loader-container${inline ? ' kc-loader-container--inline' : ''}`}>
      <div className="kc-loader-content">
        <div className="kc-spinner" />
        <h1 className="kc-loader-title">Kink Catalyst</h1>
        {subtitle && <p className="kc-loader-subtitle">{subtitle}</p>}
      </div>
      <style>{`
        .kc-loader-container {
          display: flex;
          justify-content: center;
          align-items: center;
          position: fixed;
          inset: 0;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          font-family: 'Plus Jakarta Sans', sans-serif;
          z-index: 9999;
        }

        .kc-loader-container--inline {
          position: static;
          inset: auto;
          background: none;
          padding: 56px 20px;
          z-index: auto;
        }

        .kc-loader-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .kc-loader-container--inline .kc-loader-content {
          gap: 12px;
        }

        .kc-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(59, 130, 246, 0.2);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: kc-spin 1s linear infinite;
        }

        .kc-loader-container--inline .kc-spinner {
          width: 28px;
          height: 28px;
          border-width: 3px;
          animation-duration: 0.8s;
        }

        @keyframes kc-spin {
          to { transform: rotate(360deg); }
        }

        .kc-loader-title {
          font-size: 32px;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .kc-loader-container--inline .kc-loader-title {
          font-size: 15px;
          letter-spacing: -0.2px;
        }

        .kc-loader-subtitle {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
          animation: kc-pulse 1.5s ease-in-out infinite;
        }

        .kc-loader-container--inline .kc-loader-subtitle {
          font-size: 12.5px;
        }

        @keyframes kc-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
