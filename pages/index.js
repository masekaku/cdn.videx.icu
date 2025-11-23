// Import dari root (naik 1 level dari folder pages)
import videos from '../videos.json';

// Config Runtime (Edge direkomendasikan untuk redirect cepat)
export const config = {
  runtime: 'experimental-edge',
};

export async function getServerSideProps() {
  try {
    // 1. Ambil 1 video acak
    const randomVideo = videos[Math.floor(Math.random() * videos.length)];

    // 2. Redirect 307 ke format baru dengan .mp4
    if (randomVideo && randomVideo.id) {
      return {
        redirect: {
          destination: `/f/${randomVideo.id}.mp4`,
          permanent: false,
        },
      };
    }
    
    return { props: {} };
  } catch (e) {
    return { props: {} };
  }
}

// UI Return Null (Blank)
export default function Home() {
  return null;
}
