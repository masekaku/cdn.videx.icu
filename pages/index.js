// IMPORT PENTING: Naik 1 level (..) untuk mencari videos.json di root
import videos from '../videos.json';

// Kita pakai runtime default (Nodejs) agar pembacaan file stabil
export async function getServerSideProps() {
  try {
    // 1. Ambil 1 video acak
    if (!videos || videos.length === 0) {
        return { props: {} };
    }
    
    const randomVideo = videos[Math.floor(Math.random() * videos.length)];

    // 2. Redirect ke format baru (/f/ID.mp4)
    return {
      redirect: {
        destination: `/f/${randomVideo.id}.mp4`,
        permanent: false, // 307 Temporary Redirect
      },
    };
  } catch (error) {
    console.error("Index Error:", error);
    return { props: {} };
  }
}

// Tidak menampilkan UI apa-apa (Blank)
export default function Home() {
  return null;
}
