from typing import Any
from geoalchemy2 import Geometry
from sqlalchemy import JSON, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class RoadNetwork(Base):
    __tablename__ = "road_networks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    region: Mapped[str] = mapped_column(String(128), index=True)
    road_segments: Mapped[list[dict]] = mapped_column(JSON, default=list)

    # PostGIS geometry for road network segments (SRID 4326)
    geom: Mapped[Any | None] = mapped_column(Geometry(geometry_type="MULTILINESTRING", srid=4326), nullable=True)
