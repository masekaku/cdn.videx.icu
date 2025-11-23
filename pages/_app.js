import '../styles/global.css';
// 1. Import komponen SpeedInsights
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      {/* 2. Render komponen halaman utama */}
      <Component {...pageProps} />
      
      {/* 3. Masukkan SpeedInsights di sini agar aktif di seluruh website */}
      <SpeedInsights />
    </>
  );
}
