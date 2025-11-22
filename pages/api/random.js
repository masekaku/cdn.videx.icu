import { NextResponse } from 'next/server';
import videos from '../../data/videos.json';

export const runtime = 'edge';

export default function handler() {
  const randomIndex = Math.floor(Math.random() * videos.length);
  const video = videos[randomIndex];

  return NextResponse.json(video);
}