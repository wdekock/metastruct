import re
from datetime import datetime
from math import ceil
from typing import Any, Dict, Optional

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    Integer,
    MetaData,
    String,
    Table,
    func,
    insert,
    select,
    update,
)
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession

class GenericSchemaRepository:
    def __init__(self, engine: AsyncEngine):
        self.engine = engine
        self.metadata = MetaData()

    def _build_dynamic_table(self, manifest: Dict[str, Any]) -> Table:
        entity_spec = self._entity(manifest)
        table_name = self._table_name(entity_spec["entityName"])
        properties = entity_spec.get("schema", {})
        primary_key = entity_spec["primaryKey"]

        columns = [
            Column(primary_key, self._sql_type(properties.get(primary_key, {})), primary_key=True),
            Column("created_at", DateTime, default=datetime.utcnow, nullable=False),
            Column("updated_at", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False),
            Column("deleted_at", DateTime, nullable=True),
        ]

        for prop_name, prop_attrs in properties.items():
            if prop_name in [primary_key, "created_at", "updated_at", "deleted_at"]:
                continue
            columns.append(Column(prop_name, self._sql_type(prop_attrs), nullable=not prop_attrs.get("required", False)))

        return Table(table_name, self.metadata, *columns, extend_existing=True)

    @staticmethod
    def _entity(manifest: Dict[str, Any]) -> Dict[str, Any]:
        entities = manifest.get("entities", {})
        if not entities:
            raise ValueError("Manifest does not contain any entities")
        return next(iter(entities.values()))

    @staticmethod
    def _table_name(entity_name: str) -> str:
        slug = re.sub(r"[^a-zA-Z0-9]+", "_", entity_name).strip("_").lower()
        return f"metastruct_{slug or 'entity'}"

    @staticmethod
    def _sql_type(field: Dict[str, Any]) -> Any:
        field_type = field.get("type", "string").lower()
        if field_type in {"integer", "int"}:
            return Integer
        if field_type in {"number", "float", "decimal"}:
            return Float
        if field_type in {"boolean", "bool"}:
            return Boolean
        if field_type in {"date", "datetime"}:
            return DateTime
        return String

    async def ensure_table(self, manifest: Dict[str, Any]) -> Table:
        table = self._build_dynamic_table(manifest)
        async with self.engine.begin() as connection:
            await connection.run_sync(self.metadata.create_all, tables=[table])
        return table

    async def insert_record(self, manifest: Dict[str, Any], record_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        table = await self.ensure_table(manifest)
        now = datetime.utcnow()
        primary_key = self._entity(manifest)["primaryKey"]
        payload = {**data, primary_key: record_id, "created_at": now, "updated_at": now, "deleted_at": None}

        async with self.engine.begin() as conn:
            stmt = insert(table).values(**payload)
            await conn.execute(stmt)

        return payload

    async def list_records(self, manifest: Dict[str, Any], page: int, page_size: int) -> Dict[str, Any]:
        table = await self.ensure_table(manifest)
        primary_key = self._entity(manifest)["primaryKey"]
        offset = (page - 1) * page_size
        async with AsyncSession(self.engine) as session:
            total = await session.scalar(
                select(func.count()).select_from(table).where(table.c.deleted_at.is_(None))
            )
            result = await session.execute(
                select(table)
                .where(table.c.deleted_at.is_(None))
                .order_by(table.c[primary_key])
                .offset(offset)
                .limit(page_size)
            )
            items = [dict(row._mapping) for row in result]
        total = int(total or 0)
        return {
            "items": items,
            "page": page,
            "page_size": page_size,
            "total": total,
            "pages": ceil(total / page_size) if total else 0,
        }

    async def get_by_id(self, manifest: Dict[str, Any], record_id: str) -> Optional[Dict[str, Any]]:
        table = await self.ensure_table(manifest)
        primary_key = self._entity(manifest)["primaryKey"]
        stmt = select(table).where(table.c[primary_key] == record_id, table.c.deleted_at.is_(None))

        async with AsyncSession(self.engine) as session:
            result = await session.execute(stmt)
            row = result.fetchone()
            return dict(row._mapping) if row else None

    async def update_record(self, manifest: Dict[str, Any], record_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        table = await self.ensure_table(manifest)
        primary_key = self._entity(manifest)["primaryKey"]
        values = {key: value for key, value in data.items() if key != primary_key}
        values["updated_at"] = datetime.utcnow()
        async with self.engine.begin() as connection:
            result = await connection.execute(
                update(table)
                .where(table.c[primary_key] == record_id, table.c.deleted_at.is_(None))
                .values(**values)
            )
            if result.rowcount == 0:
                return None
        return await self.get_by_id(manifest, record_id)

    async def delete_record(self, manifest: Dict[str, Any], record_id: str) -> bool:
        table = await self.ensure_table(manifest)
        primary_key = self._entity(manifest)["primaryKey"]
        async with self.engine.begin() as connection:
            result = await connection.execute(
                update(table)
                .where(table.c[primary_key] == record_id, table.c.deleted_at.is_(None))
                .values(deleted_at=datetime.utcnow())
            )
        return bool(result.rowcount)
