from enum import StrEnum


class Status(StrEnum):
    NOT_STARTED = "not-started"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"


class JudgingCategory(StrEnum):
    innovation_project = "innovation-project"
    robot_design = "robot-design"
    core_values = "core-values"
