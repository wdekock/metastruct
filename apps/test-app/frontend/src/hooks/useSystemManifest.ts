import { useState, useEffect, useRef, useCallback } from 'react';
import { SystemManifest } from '../types/manifest';

export const useSystemManifest = () => {
  const [manifest, setManifest] = useState<SystemManifest | null>(null);
  const [compiledAt, setCompiledAt] = useState<string | null>(null);
  const [records, setRecords] = useState<Record<string, any[]>>({});
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

    const wsHost = isLocal
      ? 'localhost:8000'
      : window.location.host.replace('-3000', '-8000');

    const wsUrl = `${protocol}//${wsHost}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'MANIFEST_COMPILED') {
          setManifest(data.manifest);
          setCompiledAt(new Date(data.manifest.compiledAt).toLocaleTimeString());
          if (data.records) setRecords(data.records);
        } else if (data.event === 'RECORD_MUTATED') {
          setRecords((prev) => ({
            ...prev,
            [data.entityKey]: [...(prev[data.entityKey] || []), data.record],
          }));
        }
      } catch (e) {
        console.error('Failed to parse manifest payload:', e);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const commitRecord = useCallback((entityKey: string, recordData: Record<string, any>) => {
    const record = {
      vendor_id: `vnd_${Date.now().toString().slice(-4)}`,
      ...recordData,
    };

    // 1. Optimistic update for local UI rendering (Section 5)
    setRecords((prev) => ({
      ...prev,
      [entityKey]: [...(prev[entityKey] || []), record],
    }));

    // 2. Dispatch payload back to the FastAPI backend via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          event: 'MUTATE_RECORD',
          entityKey,
          record,
        })
      );
    }
  }, []);

  return { manifest, compiledAt, records, commitRecord };
};