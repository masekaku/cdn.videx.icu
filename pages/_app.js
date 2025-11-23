// Arahkan ke folder styles di root (naik 1 level dari pages)
import '../styles/global.css';

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
