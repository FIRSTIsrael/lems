from dataclasses import dataclass


@dataclass
class Team:
    id: str
    number: int


@dataclass
class Location:
    id: str
    name: str
