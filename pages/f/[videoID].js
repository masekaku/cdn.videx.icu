import { useEffect, useRef, useState } from 'react';
import videos from '../../data/videos.json';

export const runtime = 'edge';

export async function getServerSideProps(context) {
  const rawId = Array.isArray(context.params?.videoID)
    ? context.params.videoID[0]
    : context.params?.videoID || '';

  // Hapus .mp4 (case-insensitive)
  const sanitizedId = rawId.replace(/\.mp4$/i, '');

  const video = Array.isArray(videos)
    ? videos.find((v) => v.id === sanitizedId)
    : null;

  return {
    props: {
      video: video || null
    }
  };
}

function VideoPlayerPage({ video }) {
  const videoRef = useRef(null);
  const [showContinueOverlay, setShowContinueOverlay] = useState(false);
  const [hasShownGate, setHasShownGate] = useState(false);
  const [showEndOverlay, setShowEndOverlay] = useState(false);

  // Pastikan autoplay (muted) coba dijalankan saat mount
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const playPromise = v.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch(() => {
        // Autoplay bisa saja diblok, biarkan user yang trigger play nanti
      });
    }
  }, []);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || hasShownGate || showEndOverlay) return;

    // Gate di detik ke-5
    if (v.currentTime >= 5) {
      v.pause();
      setShowContinueOverlay(true);
      setHasShownGate(true);
    }
  };

  const handleContinue = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    setShowContinueOverlay(false);
    const playPromise = v.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch(() => {
        // Abaikan error play
      });
    }
    // Event click tidak di-stopPropagation, biarkan bubbling
  };

  const handleEnded = () => {
    setShowEndOverlay(true);
    setShowContinueOverlay(false);
  };

  const handleReplay = () => {
    const v = videoRef.current;
    if (!v) return;
    setShowEndOverlay(false);
    setShowContinueOverlay(false);
    setHasShownGate(false);
    v.currentTime = 0;
    v.muted = true;
    const playPromise = v.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch(() => {});
    }
  };

  if (!video) {
    return (
      <div className="not-found">
        <p>Video Not Found</p>
        <style jsx>{`
          .not-found {
            height: 100vh;
            width: 100vw;
            background: #000;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
              sans-serif;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="page">
      <video
        ref={videoRef}
        src={video.source}
        className="video"
        playsInline
        autoPlay
        muted
        controls={false}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {showContinueOverlay && !showEndOverlay && (
        <div className="overlay continue-overlay">
          <button
            type="button"
            className="continue-button"
            onClick={handleContinue}
          >
            Tap to Continue Watching
          </button>
        </div>
      )}

      {showEndOverlay && (
        <div className="overlay end-overlay">
          <div className="end-content">
            <h1>Terima Kasih Sudah Menonton</h1>
            <p className="transparency">
              Iklan mungkin menyebalkan, tetapi itu satu-satunya cara kami untuk
              menjaga server. Kesabaran Anda sangat kami hargai dan kami harap
              layanan kami sepadan dengan usaha Anda.
            </p>
            <div className="socials">
              <a
                href="https://twitter.com/intent/tweet"
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter
              </a>
              <a
                href="https://t.me/share/url"
                target="_blank"
                rel="noopener noreferrer"
              >
                Telegram
              </a>
              <a
                href="https://www.facebook.com/sharer/sharer.php"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>
            </div>
            <button
              type="button"
              className="replay-button"
              onClick={handleReplay}
            >
              Replay
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .page {
          position: relative;
          width: 100vw;
          height: 100vh;
          background: #000;
          overflow: hidden;
        }

        .video {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #000;
        }

        /* Sembunyikan kontrol default di WebKit */
        .video::-webkit-media-controls {
          display: none !important;
          opacity: 0;
        }

        .overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          box-sizing: border-box;
        }

        .continue-overlay {
          background: radial-gradient(
            circle at center,
            rgba(0, 0, 0, 0.75),
            rgba(0, 0, 0, 0.9)
          );
        }

        .continue-button {
          padding: 0.9rem 1.6rem;
          border-radius: 999px;
          border: none;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          background: linear-gradient(135deg, #00e0ff, #00ff85);
          color: #000;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          transition: transform 0.15s ease, box-shadow 0.15s ease,
            opacity 0.15s ease;
        }

        .continue-button:hover {
          transform: translateY(-1px) scale(1.03);
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.65);
          opacity: 0.95;
        }

        .continue-button:active {
          transform: translateY(0) scale(0.98);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.6);
        }

        .end-overlay {
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.9),
            rgba(0, 0, 0, 0.7)
          );
        }

        .end-content {
          max-width: 640px;
          text-align: center;
          color: white;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
            sans-serif;
        }

        .end-content h1 {
          font-size: 1.8rem;
          margin-bottom: 1rem;
        }

        .transparency {
          font-size: 0.95rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.85);
          margin-bottom: 1.75rem;
        }

        .socials {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .socials a {
          min-width: 96px;
          padding: 0.55rem 0.9rem;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          font-size: 0.85rem;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(10px);
          transition: background 0.15s ease, transform 0.15s ease,
            border-color 0.15s ease;
        }

        .socials a:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.35);
          transform: translateY(-1px);
        }

        .replay-button {
          padding: 0.7rem 1.4rem;
          border-radius: 999px;
          border: none;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          background: white;
          color: #000;
          transition: background 0.15s ease, transform 0.15s ease,
            box-shadow 0.15s ease;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
        }

        .replay-button:hover {
          background: #f5f5f5;
          transform: translateY(-1px);
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.7);
        }

        .replay-button:active {
          transform: translateY(0);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.65);
        }

        @media (max-width: 600px) {
          .end-content h1 {
            font-size: 1.4rem;
          }
          .transparency {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}

export default VideoPlayerPage;