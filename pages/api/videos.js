import videos from '../../data/videos.json';

export const runtime = 'edge';

export default function handler(req) {
  return new Response(JSON.stringify(videos), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}