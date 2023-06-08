import hassapi as hass

"""
rollover_printer is an app responsible of the monitoring of print rollover pages

Functionalities :
. None

Notifications :
. Rollover pages < 10
"""

class rollover_printer(hass.Hass): 
    def initialize(self):
        self.listen_state(self.callback_rollover_printer, "sensor.total_rollover_pages" , new = "10")

    """
    Callback triggered when rollover pages < 10
    Goals :
    . Send notification
    """
    def callback_rollover_printer(self, entity, attribute, old, new, kwargs):
        self.log("Less than 10 pages. Notifying it...")
        self.fire_event("NOTIFIER",
            action = "send_when_present",
            title = "Imprimante",
            message = "Il reste 10 pages !",
            icon =  "mdi:printer-alert",
            color = "green",
            tag = "rollover_printer")