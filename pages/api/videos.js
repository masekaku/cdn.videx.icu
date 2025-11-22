import { NextResponse } from 'next/server';
import videos from '../../data/videos.json';

export const runtime = 'edge';

export default function handler(req) {
  const url = new URL(req.url);
  const videoID = url.searchParams.get('videoID');

  if (!videoID) {
    return NextResponse.json(
      { error: 'Missing videoID parameter' },
      { status: 400 }
    );
  }

  const cleanId = videoID.replace(/\.mp4$/i, '');
  const video = videos.find((v) => v.id === cleanId);

  if (!video) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }

  return NextResponse.json(video);
}