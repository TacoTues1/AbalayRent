import { useState, useEffect } from 'react'
import Link from 'next/link'

const COOKIE_CONSENT_KEY = 'abalay_cookie_consent'

export default function CookieConsent() {
    const [visible, setVisible] = useState(false)
    const [showPreferences, setShowPreferences] = useState(false)
    const [closing, setClosing] = useState(false)
    const [preferences, setPreferences] = useState({
        essential: true,
        analytics: true,
        functional: true,
        marketing: false,
    })

    useEffect(() => {
        const timer = setTimeout(() => {
            const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
            if (!consent) {
                setVisible(true)
            }
        }, 1500)
        return () => clearTimeout(timer)
    }, [])

    const handleClose = (choice) => {
        setClosing(true)
        setTimeout(() => {
            const base = { timestamp: new Date().toISOString() }
            if (choice === 'all') {
                localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ ...base, essential: true, analytics: true, functional: true, marketing: true }))
            } else if (choice === 'essential') {
                localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ ...base, essential: true, analytics: false, functional: false, marketing: false }))
            } else if (choice === 'custom') {
                localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ ...base, ...preferences }))
            }
            setVisible(false)
            setClosing(false)
            setShowPreferences(false)
        }, 400)
    }

    if (!visible) return null

    const prefItems = [
        { key: 'essential', icon: '🔒', name: 'Essential', desc: 'Required for the website to function properly', locked: true },
        { key: 'analytics', icon: '📊', name: 'Analytics', desc: 'Helps us understand how you use the platform', locked: false },
        { key: 'functional', icon: '⚙️', name: 'Functional', desc: 'Remembers your preferences and settings', locked: false },
        { key: 'marketing', icon: '📢', name: 'Marketing', desc: 'Used to show you relevant ads and content', locked: false },
    ]

    return (
        <>
            {/* Overlay */}
            <div
                className={`cc-overlay ${closing ? 'cc-closing' : ''}`}
                onClick={() => handleClose('essential')}
            >
                {/* Banner */}
                <div
                    className={`cc-banner ${closing ? 'cc-banner-closing' : ''}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="cc-header">
                        <div className="cc-icon-box">
                            <span className="cc-icon">🍪</span>
                        </div>
                        <div className="cc-header-text">
                            <h3 className="cc-title">We value your privacy</h3>
                            <p className="cc-desc">
                                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.{' '}
                                Read our <Link href="/privacy" className="cc-link">Privacy Policy</Link> for more information.
                            </p>
                        </div>
                    </div>

                    {/* Preferences */}
                    {showPreferences && (
                        <div className="cc-prefs">
                            {prefItems.map((item) => (
                                <div key={item.key} className="cc-pref-row">
                                    <div className="cc-pref-left">
                                        <span className="cc-pref-icon">{item.icon}</span>
                                        <div>
                                            <span className="cc-pref-name">{item.name}</span>
                                            <span className="cc-pref-desc">{item.desc}</span>
                                        </div>
                                    </div>
                                    {item.locked ? (
                                        <div className="cc-toggle-group">
                                            <div className="cc-track cc-track-on">
                                                <div className="cc-thumb cc-thumb-on" />
                                            </div>
                                            <span className="cc-badge">Always On</span>
                                        </div>
                                    ) : (
                                        <button
                                            className="cc-toggle-btn"
                                            onClick={() => setPreferences(p => ({ ...p, [item.key]: !p[item.key] }))}
                                            aria-label={`Toggle ${item.name} cookies`}
                                        >
                                            <div className={`cc-track ${preferences[item.key] ? 'cc-track-on' : 'cc-track-off'}`}>
                                                <div className={`cc-thumb ${preferences[item.key] ? 'cc-thumb-on' : 'cc-thumb-off'}`} />
                                            </div>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="cc-buttons">
                        {/* <button
                            onClick={() => setShowPreferences(!showPreferences)}
                            className="cc-btn cc-btn-secondary"
                        >
                            {showPreferences ? 'Hide Preferences' : 'Customize'}
                        </button> */}

                        {showPreferences ? (
                            <button onClick={() => handleClose('custom')} className="cc-btn cc-btn-primary">
                                Save Preferences
                            </button>
                        ) : (
                            <button onClick={() => handleClose('essential')} className="cc-btn cc-btn-secondary">
                                Reject All
                            </button>
                        )}

                        <button onClick={() => handleClose('all')} className="cc-btn cc-btn-primary">
                            Accept All
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .cc-overlay {
          position: fixed;
          inset: 0;
          z-index: 9998;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          padding: 16px;
          animation: ccFadeIn 0.4s ease-out forwards;
        }
        .cc-overlay.cc-closing {
          animation: ccFadeOut 0.4s ease-in forwards;
        }

        .cc-banner {
          width: 100%;
          max-width: 540px;
          background: #ffffff;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 -4px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
          animation: ccSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform: translateY(100%);
        }
        .cc-banner.cc-banner-closing {
          animation: ccSlideDown 0.4s ease-in forwards;
        }

        /* Header */
        .cc-header {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        .cc-icon-box {
          flex-shrink: 0;
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: linear-gradient(135deg, #FFF3E0, #FFE0B2);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: ccBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
        }
        .cc-icon {
          font-size: 24px;
          line-height: 1;
        }
        .cc-header-text {
          flex: 1;
          min-width: 0;
        }
        .cc-title {
          font-size: 17px;
          font-weight: 800;
          color: #111;
          margin: 0 0 5px 0;
          letter-spacing: -0.03em;
        }
        .cc-desc {
          font-size: 13px;
          line-height: 1.55;
          color: #6b7280;
          margin: 0;
        }

        /* Preferences */
        .cc-prefs {
          border-top: 1px solid #f0f0f0;
          padding-top: 16px;
          margin-bottom: 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          animation: ccExpand 0.3s ease-out forwards;
        }
        .cc-pref-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-radius: 12px;
          background: #f9fafb;
          border: 1px solid #f3f4f6;
          transition: background 0.2s, border-color 0.2s;
        }
        .cc-pref-row:hover {
          background: #f3f4f6;
          border-color: #e5e7eb;
        }
        .cc-pref-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }
        .cc-pref-icon {
          font-size: 18px;
          flex-shrink: 0;
          width: 28px;
          text-align: center;
        }
        .cc-pref-name {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: #111;
        }
        .cc-pref-desc {
          display: block;
          font-size: 11px;
          color: #9ca3af;
          line-height: 1.35;
        }

        /* Toggle */
        .cc-toggle-group {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .cc-toggle-btn {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        .cc-track {
          width: 40px;
          height: 22px;
          border-radius: 11px;
          position: relative;
          transition: background 0.25s ease;
        }
        .cc-track-on {
          background: #111;
        }
        .cc-track-off {
          background: #d1d5db;
        }
        .cc-thumb {
          position: absolute;
          top: 3px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
          transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cc-thumb-on {
          left: 21px;
        }
        .cc-thumb-off {
          left: 3px;
        }
        .cc-badge {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #9ca3af;
          white-space: nowrap;
        }

        /* Buttons */
        .cc-buttons {
          display: flex;
          gap: 8px;
        }
        .cc-btn {
          flex: 1;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          white-space: nowrap;
          text-align: center;
        }
        .cc-btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }
        .cc-btn-secondary:hover {
          background: #e5e7eb;
        }
        .cc-btn-primary {
          background: #111;
          color: #fff;
        }
        .cc-btn-primary:hover {
          background: #333;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
        }

        /* Animations */
        @keyframes ccFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes ccFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes ccSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes ccSlideDown {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(100%); opacity: 0; }
        }
        @keyframes ccBounce {
          0% { transform: scale(0) rotate(-20deg); opacity: 0; }
          60% { transform: scale(1.15) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes ccExpand {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Mobile */
        @media (max-width: 480px) {
          .cc-overlay {
            padding: 10px;
          }
          .cc-banner {
            padding: 18px;
            border-radius: 16px;
          }
          .cc-title {
            font-size: 15px;
          }
          .cc-desc {
            font-size: 12px;
          }
          .cc-buttons {
            flex-direction: column;
          }
          .cc-btn {
            width: 100%;
          }
        }
      `}</style>

            <style jsx global>{`
        .cc-link {
          color: #111 !important;
          font-weight: 700 !important;
          text-decoration: underline !important;
          text-underline-offset: 2px !important;
          transition: opacity 0.2s !important;
        }
        .cc-link:hover {
          opacity: 0.7 !important;
        }
      `}</style>
        </>
    )
}
