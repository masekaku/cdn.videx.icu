export const runtime = 'edge';

import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import videos from '../../data/videos.json';

export async function getServerSideProps(context) {
  const rawParam = (context.params?.videoID || '').toString();

  // Hapus akhiran .mp4 (case-insensitive) bila ada
  const cleanId = rawParam.replace(/\.mp4$/i, '');

  const video =
    Array.isArray(videos) && cleanId
      ? videos.find((v) => v.id === cleanId) || null
      : null;

  return {
    props: {
      video,
      requestedId: cleanId || rawParam
    }
  };
}

export default function VideoPage({ video, requestedId }) {
  const videoRef = useRef(null);
  const [showContinueOverlay, setShowContinueOverlay] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showEndOverlay, setShowEndOverlay] = useState(false);

  // Pastikan video mencoba autoplay saat source berubah
  useEffect(() => {
    setShowContinueOverlay(false);
    setHasInteracted(false);
    setShowEndOverlay(false);

    const vid = videoRef.current;
    if (vid) {
      vid.muted = true;
      const playPromise = vid.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          // Autoplay bisa gagal di beberapa browser; abaikan error
        });
      }
    }
  }, [video?.source]);

  const handleTimeUpdate = (event) => {
    if (!video) return;
    if (hasInteracted || showContinueOverlay || showEndOverlay) return;

    const current = event.currentTarget.currentTime || 0;

    // Hook di detik ke-5
    if (current >= 5) {
      event.currentTarget.pause();
      setShowContinueOverlay(true);
    }
  };

  const handleContinueClick = () => {
    // JANGAN stopPropagation / preventDefault agar klik tetap bubble
    setHasInteracted(true);
    setShowContinueOverlay(false);

    const vid = videoRef.current;
    if (vid) {
      vid.muted = false;
      const playPromise = vid.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    }
  };

  const handleEnded = () => {
    setShowEndOverlay(true);
  };

  const handleReplay = () => {
    const vid = videoRef.current;
    if (vid) {
      vid.currentTime = 0;
      const playPromise = vid.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    }
    setShowEndOverlay(false);
  };

  // 404 sederhana bila video tidak ditemukan
  if (!video) {
    return (
      <div className="video-page not-found">
        <Head>
          <title>404 - Video tidak ditemukan</title>
        </Head>
        <div className="end-overlay">
          <div className="end-content">
            <h1>404 - Video tidak ditemukan</h1>
            {requestedId ? (
              <p className="end-message">ID yang diminta: {requestedId}</p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="video-page">
      <Head>
        <title>Video - {video.id}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <video
        ref={videoRef}
        className="video-element"
        src={video.source}
        autoPlay
        muted
        playsInline
        controls={false}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* Overlay Hook di detik ke-5 */}
      {showContinueOverlay && !showEndOverlay && (
        <div className="overlay" onClick={handleContinueClick}>
          <div className="overlay-content">
            <p>Tap untuk melanjutkan menonton</p>
          </div>
        </div>
      )}

      {/* End Screen */}
      {showEndOverlay && (
        <div className="end-overlay">
          <div className="end-content">
            <h1>Terima Kasih Sudah Menonton</h1>
            <p className="end-message">
              Iklan mungkin menyebalkan, tetapi itu satu-satunya cara kami untuk
              menjaga server. Kesabaran Anda sangat kami hargai dan kami harap
              layanan kami sepadan dengan usaha Anda.
            </p>
            <div className="end-actions">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
              >
                Twitter
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
              >
                Telegram
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
              >
                Facebook
              </a>
              <button type="button" onClick={handleReplay} className="btn primary">
                Replay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}