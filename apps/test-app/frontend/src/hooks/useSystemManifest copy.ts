import { useState, useEffect } from 'react';
import { SystemManifest } from '../types/manifest';

export const useSystemManifest = () => {
  const [manifest, setManifest] = useState<SystemManifest | null>(null);
  const [compiledAt, setCompiledAt] = useState<string | null>(null);

  useEffect(() => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

    // Construct WebSocket endpoint URL based on environment
    const wsHost = isLocal
      ? 'localhost:8000'
      : window.location.host.replace('-3000', '-8000');

    const wsUrl = `${protocol}//${wsHost}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'MANIFEST_COMPILED') {
          setManifest(data.manifest);
          setCompiledAt(new Date(data.manifest.compiledAt).toLocaleTimeString());
        }
      } catch (e) {
        console.error('Failed to parse manifest payload:', e);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return { manifest, compiledAt };
};