from dataclasses import dataclass
from bson import ObjectId


@dataclass
class Team:
    id: ObjectId
    number: int


@dataclass
class Location:
    id: ObjectId
    name: str
