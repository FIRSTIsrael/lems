from dataclasses import dataclass
from bson import ObjectId


@dataclass
class Location:
    id: ObjectId
    name: str
