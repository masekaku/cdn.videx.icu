import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import videos from '../../videos.json';

export async function getServerSideProps(context) {
  const { videoID } = context.params;
  const cleanID = videoID.replace('.mp4', '');
  const videoData = videos.find((v) => v.id === cleanID);

  if (!videoData) return { props: { error: true } };
  return { props: { videoData, videoID } };
}

export default function VideoPlayer({ videoData, error, videoID }) {
  const videoRef = useRef(null);
  const [showHookOverlay, setShowHookOverlay] = useState(false);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [hookTriggered, setHookTriggered] = useState(false);

  // --- Autoplay Muted ---
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(e => console.log("Autoplay blocked:", e));
    }
  }, []);

  // --- Hook Detik ke-5 ---
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    if (videoRef.current.currentTime > 5 && !hookTriggered) {
      videoRef.current.pause();
      setShowHookOverlay(true);
      setHookTriggered(true);
    }
  };

  // --- Continue Watching + Pop-Under Smartlink ---
  const handleContinue = () => {
    setShowHookOverlay(false);

    if (videoRef.current) {
      videoRef.current.muted = false;   // unmute
      videoRef.current.controls = true; // show controls
      videoRef.current.play();          // play langsung
    }

    // Trigger pop-under smartlink hanya 1x per session
    if (!sessionStorage.getItem('popUnderTriggered')) {
      window.open('https://special-fishstick-a3m.pages.dev?from=' + encodeURIComponent(window.location.href), '_blank');
      sessionStorage.setItem('popUnderTriggered', 'true');
    }
  };

  // --- End Screen ---
  const handleEnded = () => {
    setShowEndScreen(true);
    if (document.fullscreenElement) document.exitFullscreen();
  };

  const handleReplay = () => {
    setShowEndScreen(false);
    setHookTriggered(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  if (error) {
    return (
      <div className="error-box">
        <h2>Video Not Found</h2>
        <style jsx>{`
          .error-box { display: flex; justify-content: center; align-items: center; height: 100vh; background: #000; color: #fff; }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{videoID}</title>
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
        />

        {/* Overlay Iklan Detik ke-5 */}
        {showHookOverlay && (
          <div className="overlay hook-overlay" onClick={handleContinue}>
            <div className="msg-box">
              <div className="play-icon">▶</div>
              <p>Tap Anywhere to Continue Watching</p>
            </div>
          </div>
        )}

        {/* Overlay Akhir Video */}
        {showEndScreen && (
          <div className="overlay end-overlay">
            <div className="end-content">
              <h2>Terima Kasih Sudah Menonton</h2>
              <div className="transparency-msg">
                <p>Iklan mungkin menyebalkan, tetapi itu satu-satunya cara kami untuk menjaga server. Kesabaran Anda sangat kami hargai dan kami harap layanan kami sepadan dengan usaha Anda.</p>
              </div>
              <div className="social-grid">
                <a href="https://twitter.com/intent/tweet" target="_blank" className="btn tw">Twitter</a>
                <a href="https://telegram.org" target="_blank" className="btn tg">Telegram</a>
                <a href="https://facebook.com" target="_blank" className="btn fb">Facebook</a>
              </div>
              <button onClick={handleReplay} className="replay-btn">↻ Putar Ulang</button>
            </div>
          </div>
        )}

        <style jsx>{`
          .player-wrapper { position: relative; width: 100vw; height: 100dvh; background: #000; overflow: hidden; }
          .video-element { width: 100%; height: 100%; object-fit: contain; }
          .overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 20; display: flex; justify-content: center; align-items: center; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); cursor: pointer; }
          .hook-overlay { cursor: pointer; }
          .msg-box { text-align: center; color: white; animation: pulse 1.5s infinite; pointer-events: auto; }
          .play-icon { font-size: 60px; margin-bottom: 10px; }
          .msg-box p { font-size: 20px; font-weight: bold; text-transform: uppercase; }
          .end-overlay { background: rgba(0,0,0,0.9); flex-direction: column; }
          .end-content { width: 90%; max-width: 450px; text-align: center; color: white; font-family: sans-serif; }
          .transparency-msg { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 13px; line-height: 1.5; color: #ccc; border: 1px solid #333; }
          .social-grid { display: flex; gap: 10px; justify-content: center; margin-bottom: 25px; }
          .btn { padding: 8px 16px; border-radius: 4px; color: white; text-decoration: none; font-size: 14px; font-weight: bold; }
          .tw { background: #1DA1F2; } .tg { background: #0088cc; } .fb { background: #4267B2; }
          .replay-btn { background: white; color: black; border: none; padding: 12px 30px; border-radius: 50px; font-size: 16px; font-weight: bold; cursor: pointer; }
          @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        `}</style>
      </div>
    </>
  );
}