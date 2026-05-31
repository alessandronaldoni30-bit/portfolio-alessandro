import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [stage, setStage] = useState('in');

  useEffect(() => {
    const onStart = () => setStage('out');
    const onDone  = () => setStage('in');
    router.events.on('routeChangeStart', onStart);
    router.events.on('routeChangeComplete', onDone);
    router.events.on('routeChangeError', onDone);
    return () => {
      router.events.off('routeChangeStart', onStart);
      router.events.off('routeChangeComplete', onDone);
      router.events.off('routeChangeError', onDone);
    };
  }, [router]);

  return (
    <div className={`route-fade${stage === 'out' ? ' leaving' : ''}`}>
      <Component {...pageProps} />
    </div>
  );
}
