from typing import TypedDict, Literal
from bson import ObjectId


class TeamAffiliation(TypedDict):
    name: str
    city: str


class Team(TypedDict):
    divisionId: ObjectId
    number: int
    name: str
    arrived: Literal[False]
    affiliation: TeamAffiliation
