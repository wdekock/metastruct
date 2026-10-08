/**
 * Example only — host app pattern for Stage 2.
 * platform-ui never imports fetch; the app does.
 */
import React, { useEffect, useState } from "react";
import { EntityForm, EntityList } from "@metastruct/platform-ui";

// replace with your API client
declare const api: {
  list: (entity: string) => Promise<{ items: Record<string, unknown>[] }>;
  create: (entity: string, data: Record<string, unknown>) => Promise<unknown>;
  remove: (entity: string, id: string) => Promise<unknown>;
};

export function Stage2EntityScreen(props: {
  manifest: unknown;
  entityName: string;
}) {
  const { manifest, entityName } = props;
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);

  const load = async () => {
    const page = await api.list(entityName);
    setItems(page.items);
  };

  useEffect(() => {
    load();
  }, [entityName]);

  return (
    <>
      <EntityForm
        manifest={manifest}
        entityName={entityName}
        initialValues={editing ?? undefined}
        onSubmit={async (data) => {
          await api.create(entityName, data);
          setEditing(null);
          await load();
        }}
        onCancel={() => setEditing(null)}
      />
      <EntityList
        manifest={manifest}
        entityName={entityName}
        items={items}
        onRefresh={load}
        onEdit={setEditing}
        onDelete={async (row) => {
          const pk = String(row.id ?? "");
          if (pk) await api.remove(entityName, pk);
          await load();
        }}
      />
    </>
  );
}
