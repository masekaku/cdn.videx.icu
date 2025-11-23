// Import videos.json dari root (naik 1 level dari pages)
import videos from '../videos.json';

// Kita gunakan runtime default (Node.js) agar pembacaan file JSON besar lebih stabil di Vercel
// export const config = { runtime: 'experimental-edge' }; 

export async function getServerSideProps() {
  try {
    // 1. Ambil 1 video acak
    const randomVideo = videos[Math.floor(Math.random() * videos.length)];

    // 2. Redirect 307 (Temporary) ke format URL baru (/f/ID.mp4)
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
    console.error(e);
    return { props: {} };
  }
}

// UI Kosong
export default function Home() {
  return null;
}
