'use client';

import { useEffect, useState } from 'react';
import AddBotPanel from './AddBotPanel';
import EmptyState from './EmptyState';

export default function Dashboard() {
  const [status, setStatus] = useState('loading...');

  useEffect(() => {
    fetch('/api/bots')
      .then((res) => res.json())
      .then((data) => setStatus(JSON.stringify(data)))
      .catch((e) => setStatus('ERROR: ' + e.message));
  }, []);

  return (
    <div style={{ padding: 40, color: 'white', background: '#0b0f0e' }}>
      <p>{status}</p>
      <AddBotPanel onAdded={() => {}} />
      <EmptyState />
    </div>
  );
}
