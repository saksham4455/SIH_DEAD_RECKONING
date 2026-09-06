"""Mock smartphone input boundary for replay and outage scenarios."""


class MockSmartphoneClient:
    def __init__(self, drive_log=None):
        self.drive_log = drive_log or []
        self.streaming = False

    def loadDriveLog(self, path):
        raise NotImplementedError("Drive-log loading is pending dataset integration")

    def startStreaming(self):
        self.streaming = True
        return iter(self.drive_log)
