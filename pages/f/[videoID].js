import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import videos from '../../data/videos.json';

// Config Edge Runtime
export const config = {
  runtime: 'experimental-edge',
};

export async function getServerSideProps(context) {
  const { videoID } = context.params;

  // 1. Sanitasi: Hapus string ".mp4" jika ada
  const cleanID = videoID.replace('.mp4', '');

  // 2. Cari data di JSON
  const videoData = videos.find((v) => v.id === cleanID);

  if (!videoData) {
    return { props: { error: true } };
  }

  return { props: { videoData } };
}

export default function VideoPlayer({ videoData, error }) {
  // State Management
  const videoRef = useRef(null);
  const [showHookOverlay, setShowHookOverlay] = useState(false); // Overlay detik ke-5
  const [showEndScreen, setShowEndScreen] = useState(false);     // Overlay akhir
  const [hookTriggered, setHookTriggered] = useState(false);     // Agar hook cuma muncul sekali

  // --- Logic 1: Autoplay Muted & Hide Controls ---
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(e => console.log("Autoplay blocked", e));
    }
  }, []);

  // --- Logic 2: Hook Detik ke-5 ---
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    // Cek jika waktu > 5 detik DAN belum pernah di-trigger
    if (videoRef.current.currentTime > 5 && !hookTriggered) {
      videoRef.current.pause(); // Pause otomatis
      setShowHookOverlay(true); // Munculkan overlay
      setHookTriggered(true);   // Tandai sudah terjadi
    }
  };

  // --- Logic 3: Interaction (Continue Watching) ---
  const handleContinue = (e) => {
    // PENTING: Tidak ada e.stopPropagation() agar event bubbling ke script iklan
    setShowHookOverlay(false);
    
    if (videoRef.current) {
      videoRef.current.muted = false; // Unmute
      videoRef.current.play();        // Lanjut main
      videoRef.current.controls = true; // Munculkan kontrol asli (opsional, user friendly)
    }
  };

  // --- Logic 4: End Screen ---
  const handleEnded = () => {
    setShowEndScreen(true);
    // Exit fullscreen jika sedang fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const handleReplay = () => {
    setShowEndScreen(false);
    setHookTriggered(true); // Jangan trigger hook 5 detik lagi saat replay
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  // --- Error View ---
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
        <title>Videy Player</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
          // Controls hidden di awal, bisa dimunculkan setelah interaksi jika mau
        />

        {/* --- OVERLAY DETIK KE-5 --- */}
        {showHookOverlay && (
          <div className="overlay hook-overlay" onClick={handleContinue}>
            <div className="tap-msg">
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
                <a href="https://twitter.com/intent/tweet" target="_blank" rel="noreferrer" className="btn twitter">Twitter</a>
                <a href="https://telegram.org" target="_blank" rel="noreferrer" className="btn telegram">Telegram</a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="btn facebook">Facebook</a>
              </div>

              <button onClick={handleReplay} className="replay-btn">
                ↻ Putar Ulang Video
              </button>
            </div>
          </div>
        )}

        <style jsx>{`
          .player-wrapper {
            position: relative;
            width: 100vw;
            height: 100dvh;
            background: #000;
            overflow: hidden;
          }

          .video-element {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
          }

          /* General Overlay Styles */
          .overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10;
            display: flex;
            justify-content: center;
            align-items: center;
            background: rgba(0, 0, 0, 0.4); /* Semi transparan */
            backdrop-filter: blur(2px);
          }

          /* Hook Overlay (Tap to Continue) */
          .hook-overlay {
            cursor: pointer;
            /* Pastikan event klik tembus/terdeteksi */
          }
          .tap-msg {
            text-align: center;
            color: #fff;
            animation: pulse 1.5s infinite;
          }
          .tap-msg .icon {
            font-size: 50px;
            margin-bottom: 10px;
          }
          .tap-msg p {
            font-size: 18px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
          }

          /* End Screen Overlay */
          .end-overlay {
            background: rgba(0, 0, 0, 0.85); /* Lebih gelap */
            flex-direction: column;
          }
          .end-content {
            width: 90%;
            max-width: 500px;
            text-align: center;
            color: #fff;
            font-family: sans-serif;
          }
          .end-content h2 {
            margin-bottom: 20px;
            font-size: 24px;
          }
          
          /* Pesan Transparansi */
          .transparency-msg {
            background: rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 25px;
            font-size: 14px;
            line-height: 1.5;
            color: #ddd;
            border: 1px solid rgba(255,255,255,0.1);
          }

          /* Social Buttons */
          .social-buttons {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-bottom: 25px;
          }
          .btn {
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
            color: white;
            font-weight: bold;
            font-size: 14px;
            transition: opacity 0.2s;
          }
          .btn:hover { opacity: 0.8; }
          .twitter { background: #1DA1F2; }
          .telegram { background: #0088cc; }
          .facebook { background: #4267B2; }

          /* Replay Button */
          .replay-btn {
            padding: 12px 30px;
            background: #fff;
            color: #000;
            border: none;
            border-radius: 50px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s;
          }
          .replay-btn:active {
            transform: scale(0.95);
          }

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
