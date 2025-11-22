export const runtime = 'edge';

import videos from '../data/videos.json';

export async function getServerSideProps() {
  const total = Array.isArray(videos) ? videos.length : 0;

  if (total === 0) {
    return {
      redirect: {
        destination: '/f/unknown.mp4',
        permanent: false,
        statusCode: 307
      }
    };
  }

  const randomIndex = Math.floor(Math.random() * total);
  const video = videos[randomIndex];

  return {
    redirect: {
      destination: `/f/${video.id}.mp4`,
      permanent: false,
      statusCode: 307
    }
  };
}

export default function Home() {
  // Tidak ada UI
  return null;
}