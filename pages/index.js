import videos from '../data/videos.json';

export const runtime = 'edge';

export async function getServerSideProps() {
  const randomIndex = Math.floor(Math.random() * videos.length);
  const video = videos[randomIndex];

  if (!video) {
    return {
      notFound: true
    };
  }

  return {
    redirect: {
      destination: `/f/${video.id}.mp4`,
      permanent: false // Next akan menggunakan status 307 untuk redirect non-permanent
    }
  };
}

export default function IndexPage() {
  // User tidak melihat apa-apa, langsung redirect dari getServerSideProps
  return null;
}