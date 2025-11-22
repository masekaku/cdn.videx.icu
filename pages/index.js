// pages/index.js
import videos from '../data/videos.json';

export default function Home() {
  // Gateway tanpa UI
  return null;
}

export async function getServerSideProps() {
  if (!Array.isArray(videos) || videos.length === 0) {
    return {
      notFound: true
    };
  }

  const randomIndex = Math.floor(Math.random() * videos.length);
  const randomVideo = videos[randomIndex];

  return {
    redirect: {
      destination: `/f/${randomVideo.id}.mp4`,
      permanent: false // Next akan mengirim 307 untuk redirect sementara
    }
  };
}