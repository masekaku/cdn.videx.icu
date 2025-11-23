import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
// IMPORT PENTING: Naik 2 level (../..) dari 'pages/f' ke 'root'
import videos from '../../videos.json';

export async function getServerSideProps(context) {
  const { videoID } = context.params;

  // 1. Sanitasi: Hapus ".mp4" agar cocok dengan ID di JSON
  // Contoh: URL "abc.mp4" -> ID "abc"
  const cleanID = videoID ? videoID.replace('.mp4', '') : '';

  // 2. Cari data di database
  const videoData = videos.find((v) => v.id === cleanID);

  // Jika tidak ketemu, kirim sinyal error
  if (!videoData) {
    return { props: { error: true } };
  }

  return { props: { videoData, videoID } };
}

export default function VideoPlayer({ videoData, error, videoID }) {
  const videoRef = useRef(null);
  
  // State untuk Iklan & End Screen
  const [showHookOverlay, setShowHookOverlay] = useState(false);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [hookTriggered, setHookTriggered] = useState(false);

  // --- Logic 1: Autoplay Muted (Wajib Muted agar jalan di HP) ---
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(err => console.log("Autoplay blocked:", err));
    }
  }, []);

  // --- Logic 2: Hook Detik ke-5 ---
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    // Jika waktu > 5 detik DAN belum pernah trigger iklan
    if (videoRef.current.currentTime > 5 && !hookTriggered) {
      videoRef.current.pause(); // Pause video
      setShowHookOverlay(true); // Munculkan overlay
      setHookTriggered(true);   // Kunci agar tidak muncul lagi sesi ini
    }
  };

  // --- Logic 3: Tombol "Continue Watching" ---
  const handleContinue = () => {
    // Overlay hilang
    setShowHookOverlay(false);
    
    // Video lanjut main + SUARA NYALA
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.controls = true; // Munculkan kontrol play/pause asli
      videoRef.current.play();
    }
  };

  // --- Logic 4: Video Selesai (End Screen) ---
  const handleEnded = () => {
    setShowEndScreen(true);
    // Keluar fullscreen otomatis jika sedang fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleReplay = () => {
    setShowEndScreen(false);
    // Kita set hookTriggered = true agar iklan 5 detik TIDAK muncul lagi saat replay
    // Jika ingin muncul lagi, ubah jadi setHookTriggered(false)
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  // Tampilan Error jika video tidak ada
  if (error) {
    return (
      <div className="error-container">
        <h1>Video Not Found</h1>
        <style jsx>{`
          .error-container { display: flex; height: 100vh; justify-content: center; align-items: center; background: #000; color: white; font-family: sans-serif; }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{videoID}</title>
      </Head>

      <div className="player-wrapper">
        <video
          ref={videoRef}
          src={videoData.source}
          className="video-element"
          playsInline
          webkit-playsinline="true"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />

        {/* --- OVERLAY IKLAN (Detik 5) --- */}
        {showHookOverlay && (
          <div className="overlay hook-overlay" onClick={handleContinue}>
            <div className="msg-box">
              <div className="icon">▶</div>
              <p>Tap to Continue Watching</p>
            </div>
          </div>
        )}

        {/* --- OVERLAY END SCREEN --- */}
        {showEndScreen && (
          <div className="overlay end-overlay">
            <div className="end-content">
              <h2>Terima Kasih Sudah Menonton</h2>
              
              <div className="transparency-msg">
                <p>Iklan mungkin menyebalkan, tetapi itu satu-satunya cara kami untuk menjaga server. Kesabaran Anda sangat kami hargai dan kami harap layanan kami sepadan dengan usaha Anda.</p>
              </div>

              <div className="social-buttons">
                <a href="https://twitter.com/intent/tweet" target="_blank" className="btn tw">Twitter</a>
                <a href="https://telegram.org" target="_blank" className="btn tg">Telegram</a>
                <a href="https://facebook.com" target="_blank" className="btn fb">Facebook</a>
              </div>

              <button onClick={handleReplay} className="replay-btn">
                ↻ Putar Ulang
              </button>
            </div>
          </div>
        )}

        {/* Styling CSS Lokal */}
        <style jsx>{`
          .player-wrapper {
            position: relative; width: 100vw; height: 100dvh; background: #000; overflow: hidden;
          }
          .video-element {
            width: 100%; height: 100%; object-fit: contain;
          }
          
          /* Overlay Umum */
          .overlay {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 50;
            display: flex; justify-content: center; align-items: center;
            background: rgba(0,0,0,0.4); backdrop-filter: blur(5px);
          }

          /* Hook Overlay Styles */
          .hook-overlay { cursor: pointer; }
          .msg-box { text-align: center; color: white; animation: pulse 1.5s infinite; pointer-events: none; }
          .icon { font-size: 60px; margin-bottom: 15px; }
          .msg-box p { font-size: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }

          /* End Screen Styles */
          .end-overlay { background: rgba(0,0,0,0.9); flex-direction: column; }
          .end-content { width: 90%; max-width: 500px; text-align: center; color: white; font-family: sans-serif; }
          
          .transparency-msg {
            background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 20px 0;
            font-size: 13px; line-height: 1.5; color: #ddd; border: 1px solid #444;
          }
          
          .social-buttons { display: flex; gap: 10px; justify-content: center; margin-bottom: 25px; }
          .btn { padding: 10px 20px; border-radius: 5px; color: white; text-decoration: none; font-weight: bold; font-size: 14px; }
          .tw { background: #1DA1F2; } .tg { background: #0088cc; } .fb { background: #4267B2; }
          
          .replay-btn {
            background: white; color: black; border: none; padding: 12px 35px; border-radius: 50px;
            font-size: 16px; font-weight: bold; cursor: pointer; transition: transform 0.2s;
          }
          .replay-btn:active { transform: scale(0.95); }

          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </>
  );
}
