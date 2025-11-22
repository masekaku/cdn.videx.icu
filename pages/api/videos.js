// pages/api/videos.js
import videos from '../../data/videos.json';

export default function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    res.status(200).json(videos);
    return;
  }

  const rawId = Array.isArray(id) ? id[0] : id;
  const cleanedId = rawId.replace(/\.mp4$/i, '');

  const video = videos.find((v) => v.id === cleanedId);

  if (!video) {
    res.status(404).json({ error: 'Video not found' });
    return;
  }

  res.status(200).json(video);
}