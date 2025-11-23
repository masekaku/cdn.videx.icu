import '../styles/global.css';
// Coba import variasi ini agar lebih kompatibel
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <SpeedInsights />
    </>
  );
}
