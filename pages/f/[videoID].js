// pages/f/[videoID].js
import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import videos from '../../data/videos.json';

export async function getServerSideProps(context) {
  const rawParam = Array.isArray(context.params.videoID)
    ? context.params.videoID[0]
    : context.params.videoID;

  // Sanitasi: hapus .mp4 di akhir (case-insensitive)
  const cleanedId = rawParam.replace(/\.mp4$/i, '');

  const video = videos.find((v) => v.id === cleanedId);

  if (!video) {
    return { notFound: true };
  }

  return {
    props: {
      video
    }
  };
}

export default function VideoPlayerPage({ video }) {
  const videoRef = useRef(null);

  const [showContinueOverlay, setShowContinueOverlay] = useState(false);
  const [showEndOverlay, setShowEndOverlay] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);

  // Autoplay + retention hook 5 detik
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    let timeoutId;

    const run = async () => {
      try {
        // Coba autoplay (muted)
        await el.play();
      } catch (err) {
        // Jika autoplay diblok, langsung munculkan overlay "Tap to Continue"
        setShowContinueOverlay(true);
        return;
      }

      // Retention hook di detik ke-5
      timeoutId = window.setTimeout(() => {
        if (!hasUserInteracted && !el.paused) {
          el.pause();
          setShowContinueOverlay(true);
        }
      }, 5000);
    };

    run();

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [hasUserInteracted]);

  const handleContinue = () => {
    const el = videoRef.current;
    if (!el) return;

    setHasUserInteracted(true);
    setShowContinueOverlay(false);
    setIsMuted(false);
    setShowControls(true);

    // Jangan blok bubbling (tidak ada event.stopPropagation di sini)
    el
      .play()
      .catch(() => {
        // Silent fail jika play() tetap diblok
      });
  };

  const handleEnded = () => {
    setShowEndOverlay(true);
  };

  const handleReplay = () => {
    const el = videoRef.current;
    if (!el) return;

    setShowEndOverlay(false);
    el.currentTime = 0;
    el
      .play()
      .catch(() => {
        // Silent fail
      });
  };

  return (
    <>
      <Head>
        <title>{video.title} | Modern Video Player</title>
        <meta name="description" content={video.description || video.title} />
      </Head>

      <div className="page">
        <main className="player-container">
          <div className="video-shell">
            <video
              ref={videoRef}
              className="video-element"
              src={video.src}
              poster={video.poster}
              playsInline
              autoPlay
              muted={isMuted}
              controls={showControls}
              onEnded={handleEnded}
            />

            {/* Overlay "Tap to Continue" pada detik ke-5 */}
            {showContinueOverlay && !showEndOverlay && (
              <div className="overlay continue-overlay" onClick={handleContinue}>
                <div className="overlay-inner">
                  <h2 className="overlay-title">Tap to Continue</h2>
                  <p className="overlay-text">
                    Video akan dilanjutkan tanpa mute dan dengan kontrol penuh
                    setelah Anda menyentuh layar.
                  </p>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={handleContinue}
                  >
                    Lanjutkan Menonton
                  </button>
                </div>
              </div>
            )}

            {/* End Screen Overlay */}
            {showEndOverlay && (
              <div className="overlay end-overlay">
                <div className="overlay-inner end-inner">
                  <h2 className="end-title">Terima Kasih Sudah Menonton</h2>
                  <p className="end-message">
                    Iklan mungkin menyebalkan, tetapi itu satu-satunya cara kami
                    untuk menjaga server. Kesabaran Anda sangat kami hargai dan
                    kami harap layanan kami sepadan dengan usaha Anda.
                  </p>

                  <div className="social-links">
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-button"
                    >
                      Twitter
                    </a>
                    <a
                      href="https://t.me"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-button"
                    >
                      Telegram
                    </a>
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-button"
                    >
                      Facebook
                    </a>
                  </div>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleReplay}
                  >
                    Replay Video
                  </button>
                </div>
              </div>
            )}

            {/* Informasi singkat video untuk konteks & kredibilitas */}
            <div className="video-meta">
              <h1 className="video-title">{video.title}</h1>
              {video.description && (
                <p className="video-description">{video.description}</p>
              )}
            </div>
          </div>
        </main>

        <style jsx>{`
          .page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            background: radial-gradient(
                circle at top,
                rgba(56, 189, 248, 0.18),
                transparent 60%
              ),
              radial-gradient(
                circle at bottom,
                rgba(129, 140, 248, 0.16),
                transparent 55%
              ),
              #050510;
          }

          .player-container {
            width: 100%;
            max-width: 1080px;
          }

          .video-shell {
            position: relative;
            width: 100%;
            background: #000;
            border-radius: 1rem;
            overflow: hidden;
            box-shadow: 0 18px 50px rgba(15, 23, 42, 0.75);
          }

          .video-element {
            display: block;
            width: 100%;
            height: auto;
            aspect-ratio: 16 / 9;
            background-color: #000;
          }

          .overlay {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            background: radial-gradient(
                circle at center,
                rgba(15, 23, 42, 0.95),
                rgba(15, 23, 42, 0.99)
              );
            color: #f9fafb;
            text-align: center;
          }

          .overlay-inner {
            width: 100%;
            max-width: 420px;
            padding: 1.75rem 1.5rem;
            border-radius: 0.75rem;
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid rgba(148, 163, 184, 0.4);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.65);
          }

          .overlay-title {
            font-size: 1.4rem;
            font-weight: 700;
            margin-bottom: 0.75rem;
          }

          .overlay-text {
            font-size: 0.95rem;
            line-height: 1.5;
            color: #e5e7eb;
            margin-bottom: 1.5rem;
          }

          .primary-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.75rem 1.5rem;
            border-radius: 999px;
            border: none;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.95rem;
            background: linear-gradient(
              135deg,
              #22c55e,
              #16a34a 45%,
              #0ea5e9 100%
            );
            color: #0b1220;
            box-shadow: 0 10px 30px rgba(34, 197, 94, 0.45);
            transition: transform 0.12s ease, box-shadow 0.12s ease,
              filter 0.12s ease;
            width: 100%;
          }

          .primary-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 16px 40px rgba(34, 197, 94, 0.55);
            filter: brightness(1.07);
          }

          .primary-button:active {
            transform: translateY(0);
            box-shadow: 0 10px 25px rgba(34, 197, 94, 0.45);
          }

          .end-inner {
            max-width: 520px;
          }

          .end-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.9rem;
          }

          .end-message {
            font-size: 0.97rem;
            line-height: 1.7;
            color: #e5e7eb;
            margin-bottom: 1.5rem;
            text-align: left;
          }

          .social-links {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            margin-bottom: 1.25rem;
          }

          .social-button {
            flex: 1 1 30%;
            min-width: 90px;
            padding: 0.5rem 0.75rem;
            border-radius: 999px;
            border: 1px solid rgba(148, 163, 184, 0.6);
            font-size: 0.85rem;
            font-weight: 500;
            cursor: pointer;
            background: rgba(15, 23, 42, 0.9);
            color: #e5e7eb;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: background 0.12s ease, transform 0.12s ease,
              border-color 0.12s ease;
          }

          .social-button:hover {
            background: rgba(30, 64, 175, 0.95);
            border-color: rgba(129, 140, 248, 0.9);
            transform: translateY(-1px);
          }

          .secondary-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.6rem 1.25rem;
            border-radius: 999px;
            border: none;
            cursor: pointer;
            font-weight: 500;
            font-size: 0.9rem;
            background: rgba(15, 23, 42, 0.9);
            color: #e5e7eb;
            border: 1px solid rgba(148, 163, 184, 0.6);
            transition: background 0.12s ease, border-color 0.12s ease,
              transform 0.12s ease;
          }

          .secondary-button:hover {
            background: rgba(31, 41, 55, 0.95);
            border-color: rgba(148, 163, 184, 0.9);
            transform: translateY(-1px);
          }

          .video-meta {
            padding: 1rem 1.25rem 1.3rem;
            background: linear-gradient(
              to right,
              rgba(15, 23, 42, 0.96),
              rgba(15, 23, 42, 0.98)
            );
            border-top: 1px solid rgba(31, 41, 55, 0.95);
          }

          .video-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 0.35rem;
          }

          .video-description {
            font-size: 0.9rem;
            line-height: 1.5;
            color: #9ca3af;
          }

          @media (max-width: 640px) {
            .page {
              padding: 0.75rem;
            }

            .video-shell {
              border-radius: 0.75rem;
            }

            .overlay-inner {
              padding: 1.25rem 1rem;
            }

            .end-message {
              font-size: 0.9rem;
            }

            .social-links {
              flex-direction: column;
            }

            .social-button {
              width: 100%;
            }

            .video-meta {
              padding: 0.85rem 0.85rem 1rem;
            }

            .video-title {
              font-size: 1rem;
            }

            .video-description {
              font-size: 0.85rem;
            }
          }
        `}</style>
      </div>
    </>
  );
}