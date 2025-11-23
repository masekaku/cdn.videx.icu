import videos from '../data/videos.json';

// Config Edge Runtime
export const config = {
  runtime: 'experimental-edge',
};

export async function getServerSideProps() {
  // 1. Ambil 1 video acak langsung dari import (tanpa fs/fetch)
  const randomVideo = videos[Math.floor(Math.random() * videos.length)];

  // 2. Redirect 307 (Temporary) ke format baru dengan akhiran .mp4
  return {
    redirect: {
      destination: `/f/${randomVideo.id}.mp4`,
      permanent: false,
    },
  };
}

// UI Return Null (Tanpa Tampilan)
export default function Home() {
  return null;
}
