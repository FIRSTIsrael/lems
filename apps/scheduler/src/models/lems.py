from dataclasses import dataclass


@dataclass
class Team:
    id: str
    number: int
    region: str
    slug: str  # URL-friendly identifier (region-number format)


@dataclass
class Location:
    id: str
    name: str
