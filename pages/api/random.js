// pages/api/random.js
import videos from '../../data/videos.json';

export default function handler(req, res) {
  if (!Array.isArray(videos) || videos.length === 0) {
    res.status(500).json({ error: 'No videos available' });
    return;
  }

  const randomIndex = Math.floor(Math.random() * videos.length);
  const randomVideo = videos[randomIndex];

  res.status(200).json(randomVideo);
}