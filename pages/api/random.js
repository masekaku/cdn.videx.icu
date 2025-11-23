import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    // 1. Tentukan lokasi file videos.json
    // Pastikan file 'videos.json' ada di folder 'data' di root project kamu
    // Jika file ada di root langsung, hapus bagian 'data'
    const filePath = path.join(process.cwd(), 'videos.json'); 

    // Cek apakah file ada
    if (!fs.existsSync(filePath)) {
      // Coba cek di folder public jika di root tidak ada (opsional fallback)
      return res.status(404).json({ error: 'Database video tidak ditemukan' });
    }

    // 2. Baca file hanya di server (Cepat)
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const videos = JSON.parse(fileContents);

    if (!videos || videos.length === 0) {
      return res.status(404).json({ error: 'List video kosong' });
    }

    // 3. Pilih 1 video secara acak
    const randomVideo = videos[Math.floor(Math.random() * videos.length)];

    // 4. Kirim HANYA 1 data video (Sangat Ringan)
    res.status(200).json(randomVideo);

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}