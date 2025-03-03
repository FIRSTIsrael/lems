import logging
import csv
import os


class CSVLoggerHandler(logging.Handler):
    def __init__(self, filename):
        super().__init__()
        self.filename = filename

        # Create the file if it doesn't exist
        if not os.path.exists(self.filename):
            open(self.filename, mode="w").close()

    def set_filename(self, filename):
        self.filename = filename
        # Create the file if it doesn't exist
        if not os.path.exists(self.filename):
            open(self.filename, mode="w").close()

    def emit(self, record):
        log_entry = self.format(record)
        log_data = log_entry.split(",")
        with open(self.filename, mode="a", newline="") as file:
            writer = csv.writer(file)
            writer.writerow(log_data)
