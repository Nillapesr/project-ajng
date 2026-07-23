'use client';

import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [status, setStatus] = useState('loading...');

  useEffect(() => {
    fetch('/api/bots')
      .then((res) => res.json())
      .then((data) => setStatus(JSON.stringify(data)))
      .catch((e) => setStatus('ERROR: ' + e.message));
  }, []);

  return <div style={{ padding: 40, color: 'white', background: '#0b0f0e' }}>{status}</div>;
}
