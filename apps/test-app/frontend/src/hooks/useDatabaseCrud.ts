import { useState, useCallback } from 'react';

export const useDatabaseCrud = (entityName: string) => {
  const [records, setRecords] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:8000'
      : `${window.location.protocol}//${window.location.host.replace('-3000', '-8000')}`;

  const fetchRecords = useCallback(async () => {
    if (!entityName) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/db/${entityName}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setRecords(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  }, [apiBase, entityName]);

  const createRecord = async (record: Record<string, any>) => {
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/db/${entityName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      if (!res.ok) throw new Error('Failed to create record');
      await fetchRecords();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateRecord = async (recordId: string, record: Record<string, any>) => {
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/db/${entityName}/${recordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      if (!res.ok) throw new Error('Failed to update record');
      await fetchRecords();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteRecord = async (recordId: string) => {
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/db/${entityName}/${recordId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete record');
      await fetchRecords();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return {
    records,
    loading,
    error,
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
  };
};