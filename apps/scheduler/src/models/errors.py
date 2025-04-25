from models.validator import ValidatorData


class SchedulerError(Exception):
    def __init__(self, message: str, *args):
        super().__init__(message, *args)


class ValidatorError(Exception):
    def __init__(self, message: str, data: list[ValidatorData], *args):
        super().__init__(message, *args)
        self.data = data
