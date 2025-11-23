import videosData from '../../videos.json';

export default function handler(req, res) {
  const { videoID } = req.query;

  if (!videoID) {
    return res.status(400).json({ error: 'videoID parameter is required' });
  }

  const video = videosData.find(v => v.id === videoID);

  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  return res.json(video);
}