import videos from '../../data/videos.json';

export const runtime = 'edge';

export default function handler(req) {
  if (!Array.isArray(videos) || videos.length === 0) {
    return new Response(JSON.stringify({ error: 'No videos available' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const randomIndex = Math.floor(Math.random() * videos.length);
  const video = videos[randomIndex];

  return new Response(JSON.stringify(video), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}