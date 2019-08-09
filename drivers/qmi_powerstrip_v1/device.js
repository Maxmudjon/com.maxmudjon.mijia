const Homey = require("homey");
const miio = require("miio");

class CHINGMISmartPowerStrip extends Homey.Device {
  async onInit() {
    this.initialize = this.initialize.bind(this);
    this.driver = this.getDriver();
    this.data = this.getData();
    this.initialize();
    this.log("MiJia device init | " + "name: " + this.getName() + " - " + "class: " + this.getClass() + " - " + "data: " + JSON.stringify(this.data));
  }

  async initialize() {
    this.registerCapabilities();
    this.getXiaomiStatus();
  }

  registerCapabilities() {
    this.registerOnOffButton("onoff");
  }

  getXiaomiStatus() {
    var that = this;
    miio
      .device({ address: this.getSetting("deviceIP"), token: this.getSetting("deviceToken") })
      .then(device => {
        this.setAvailable();
        const { triggers } = this.driver;
        this.device = device;

        this.device
          .call("get_prop", ["power", "power_consume_rate", "current", "voltage", "temperature"])
          .then(result => {
            that.setCapabilityValue("onoff", result[0] == "on" ? true : false);
            that.setCapabilityValue("measure_power", parseInt(result[1]));
            that.setCapabilityValue("meter_ampere", result[2] / 1000);
            let tokens = { ampere: result[2] / 1000 };
            that.triggerFlow(triggers.meterAmpere, "meterAmpere", tokens);
            that.setCapabilityValue("measure_voltage", result[3] / 100);
            that.setCapabilityValue("measure_temperature", result[4]);
          })
          .catch(error => that.log("Sending commmand 'get_prop' error: ", error));

        var update = this.getSetting("updateTimer") || 60;
        this.updateTimer(update);
      })
      .catch(error => {
        this.log(error);
        if (error == "Error: Could not connect to device, handshake timeout") {
          this.setUnavailable(Homey.__("Could not connect to device, handshake timeout"));
          this.log("Error: Could not connect to device, handshake timeout");
        } else if (error == "Error: Could not connect to device, token might be wrong") {
          this.setUnavailable(Homey.__("Could not connect to device, token might be wrong"));
          this.log("Error: Could not connect to device, token might be wrong");
        }
        setTimeout(() => {
          this.getXiaomiStatus();
        }, 10000);
      });
  }

  updateTimer(interval) {
    const { triggers } = this.driver;
    var that = this;
    clearInterval(this.updateInterval);
    this.updateInterval = setInterval(() => {
      this.device
        .call("get_prop", ["power", "power_consume_rate", "current", "voltage", "temperature"])
        .then(result => {
          that.setCapabilityValue("onoff", result[0] == "on" ? true : false);
          that.setCapabilityValue("measure_power", parseInt(result[1]));
          that.setCapabilityValue("meter_ampere", result[2] / 1000);
          let tokens = { ampere: result[2] / 1000 };
          that.triggerFlow(triggers.meterAmpere, "meterAmpere", tokens);
          that.setCapabilityValue("measure_voltage", result[3] / 100);
          that.setCapabilityValue("measure_temperature", result[4]);
        })
        .catch(error => that.log("Sending commmand 'get_prop' error: ", error));
    }, 1000 * interval);
  }

  onSettings(oldSettings, newSettings, changedKeys, callback) {
    if (changedKeys.includes("updateTimer") || changedKeys.includes("deviceIP") || changedKeys.includes("deviceToken")) {
      this.getXiaomiStatus();
      callback(null, true);
    }
  }

  registerOnOffButton(name) {
    this.registerCapabilityListener(name, async value => {
      this.device
        .call("set_power", [value ? "on" : "off"])
        .then(() => this.log("Sending " + name + " commmand: " + value))
        .catch(error => this.log("Sending commmand 'set_power' error: ", error));
    });
  }

  triggerFlow(trigger, name, value) {
    if (!trigger) {
      return;
    }

    if (value) {
      trigger.trigger(this, value, true);
    }

    switch (name) {
      case "meterAmpere":
    }
  }

  onAdded() {
    this.log("Device added");
  }

  onDeleted() {
    this.log("Device deleted deleted");
    clearInterval(this.updateInterval);
    if (typeof this.device !== "undefined") {
      this.device.destroy();
    }
  }
}

module.exports = CHINGMISmartPowerStrip;
