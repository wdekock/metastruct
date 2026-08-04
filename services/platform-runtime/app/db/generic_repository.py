from typing import Any, Dict, List, Optional
from sqlalchemy import Table, Column, String, DateTime, MetaData, select, insert
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession
from datetime import datetime

class GenericSchemaRepository:
    def __init__(self, engine: AsyncEngine):
        self.engine = engine
        self.metadata = MetaData()

    def _build_dynamic_table(self, manifest: Dict[str, Any]) -> Table:
        entity_spec = manifest.get("entity", {})
        table_name = entity_spec.get("title", "dynamic_entity").lower()
        properties = entity_spec.get("properties", {})

        columns = [
            Column("id", String, primary_key=True),
            Column("created_at", DateTime, default=datetime.utcnow, nullable=False),
            Column("updated_at", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False),
            Column("deleted_at", DateTime, nullable=True),
        ]

        for prop_name, prop_attrs in properties.items():
            if prop_name in ["id", "created_at", "updated_at", "deleted_at"]:
                continue
            columns.append(Column(prop_name, String, nullable=True))

        return Table(table_name, self.metadata, *columns, extend_existing=True)

    async def insert_record(self, manifest: Dict[str, Any], record_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        table = self._build_dynamic_table(manifest)
        now = datetime.utcnow()
        payload = {**data, "id": record_id, "created_at": now, "updated_at": now, "deleted_at": None}

        async with self.engine.begin() as conn:
            await conn.execute(table.schema, self.metadata)
            stmt = insert(table).values(**payload)
            await conn.execute(stmt)

        return payload

    async def get_by_id(self, manifest: Dict[str, Any], record_id: str) -> Optional[Dict[str, Any]]:
        table = self._build_dynamic_table(manifest)
        stmt = select(table).where(table.c.id == record_id, table.c.deleted_at.is_(None))

        async with AsyncSession(self.engine) as session:
            result = await session.execute(stmt)
            row = result.fetchone()
            return dict(row._mapping) if row else None
