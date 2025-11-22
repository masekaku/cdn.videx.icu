import { useEffect, useRef, useState } from 'react';
import videos from '../../data/videos.json';

export const runtime = 'edge';

export async function getServerSideProps(context) {
  const { videoID } = context.params || {};
  const cleanId = (videoID || '').replace(/\.mp4$/i, '');
  const video = videos.find((v) => v.id === cleanId);

  if (!video) {
    return {
      notFound: true
    };
  }

  return {
    props: {
      video
    }
  };
}

function VideoPlayerPage({ video }) {
  const videoRef = useRef(null);
  const [showTapOverlay, setShowTapOverlay] = useState(false);
  const [hasResumed, setHasResumed] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  // Fase 1 & 2: Autoplay muted, lalu berhenti di detik ke-5 dan tampilkan overlay "Tap to Continue"
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    // Pastikan mulai dalam keadaan muted + autoplay
    el.muted = true;
    const playPromise = el.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch(() => {
        // Jika autoplay diblok, paksa user tap dengan tampilkan overlay
        setShowTapOverlay(true);
      });
    }

    const handleTimeUpdate = () => {
      if (!hasResumed && el.currentTime >= 5) {
        el.pause();
        setShowTapOverlay(true);
      }
    };

    el.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      el.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [hasResumed]);

  // Fase 3: Klik overlay/container -> play + unmute
  const handlePlayerClick = () => {
    // Hanya respon saat masih di fase "Tap to Continue" dan belum fase "Terima Kasih"
    if (!showTapOverlay || showThankYou) return;

    const el = videoRef.current;
    if (!el) return;

    setShowTapOverlay(false);
    setHasResumed(true);

    el.muted = false;
    const playPromise = el.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch(() => {
        // Kalau masih gagal meskipun sudah user-interaction, abaikan saja
      });
    }
  };

  // Fase 4: Selesai -> Overlay "Terima Kasih"
  const handleEnded = () => {
    setShowTapOverlay(false);
    setShowThankYou(true);
  };

  return (
    <div className="player-root">
      <div className="player-shell" onClick={handlePlayerClick}>
        <video
          ref={videoRef}
          src={video.source}
          className="player-video"
          autoPlay
          muted
          playsInline
          onEnded={handleEnded}
        />

        {showTapOverlay && (
          <div className="overlay overlay-tap">
            <div className="overlay-content">
              <p>Tap untuk melanjutkan &amp; menyalakan suara</p>
              <span className="overlay-sub">Sentuh di mana saja pada layar</span>
            </div>
          </div>
        )}

        {showThankYou && (
          <div className="overlay overlay-thankyou">
            <div className="overlay-content">
              <h1>Terima Kasih</h1>
              <p className="overlay-message">
                Iklan mungkin menyebalkan, tetapi itu satu-satunya cara kami
                untuk menjaga server tetap hidup dan konten tetap gratis.
              </p>
              <div className="social-buttons">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="social-btn"
                >
                  Twitter
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="social-btn"
                >
                  Instagram
                </a>
                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noreferrer"
                  className="social-btn"
                >
                  Telegram
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .player-root {
          width: 100vw;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #000;
        }

        .player-shell {
          position: relative;
          width: 100%;
          height: 100%;
          max-width: 900px;
          max-height: 100vh;
          cursor: pointer;
        }

        .player-video {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #000;
        }

        .overlay {
          position: absolute;
          inset: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 1.5rem;
        }

        .overlay-tap {
          background: radial-gradient(
            circle at center,
            rgba(0, 0, 0, 0.4),
            rgba(0, 0, 0, 0.85)
          );
        }

        .overlay-thankyou {
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.8),
            rgba(0, 0, 0, 0.95)
          );
        }

        .overlay-content {
          max-width: 480px;
        }

        .overlay-content p {
          margin-bottom: 0.5rem;
        }

        .overlay-sub {
          font-size: 0.85rem;
          opacity: 0.8;
        }

        .overlay-message {
          margin: 0.75rem 0 1.5rem;
          font-size: 0.95rem;
          line-height: 1.5;
          opacity: 0.9;
        }

        .social-buttons {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.75rem;
        }

        .social-btn {
          padding: 0.5rem 1.1rem;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.45);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          background: rgba(255, 255, 255, 0.05);
          transition: background 0.2s ease, transform 0.1s ease;
        }

        .social-btn:hover {
          background: rgba(255, 255, 255, 0.14);
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .overlay-message {
            font-size: 0.85rem;
          }

          .social-btn {
            font-size: 0.8rem;
            padding: 0.45rem 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}

export default VideoPlayerPage;