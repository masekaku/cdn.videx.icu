import videos from '../data/videos.json';

export const runtime = 'edge';

export async function getServerSideProps() {
  if (!Array.isArray(videos) || videos.length === 0) {
    return {
      notFound: true
    };
  }

  const randomIndex = Math.floor(Math.random() * videos.length);
  const video = videos[randomIndex];

  return {
    redirect: {
      destination: `/f/${video.id}.mp4`,
      permanent: false,
      statusCode: 307
    }
  };
}

function IndexPage() {
  return null;
}

export default IndexPage;