const Homey = require("homey");

class SmokeSensor extends Homey.Device {
  async onInit() {
    this.initialize = this.initialize.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
    this.driver = this.getDriver();
    this.data = this.getData();
    this.initialize();
    this.log("MiJia device init | " + "name: " + this.getName() + " - " + "class: " + this.getClass() + " - " + "data: " + JSON.stringify(this.data));
  }

  async initialize() {
    if (Homey.app.mihub.hubs) {
      this.registerStateChangeListener();
    } else {
      this.unregisterStateChangeListener();
    }
  }

  handleStateChange(device) {
    if (device["data"]["voltage"]) {
      var battery = (device["data"]["voltage"] - 2800) / 5;
      this.updateCapabilityValue("measure_battery", battery > 100 ? 100 : battery);
      this.updateCapabilityValue("alarm_battery", battery <= 20 ? true : false);
    }

    var settings = this.getSettings();

    if (device["data"]["alarm"] == "1") {
      this.updateCapabilityValue("alarm_smoke", true);
      var width = 0;
      var id = setInterval(frame.bind(this), settings.alarm_duration_number);
      function frame() {
        if (width == 1000) {
          clearInterval(id);
          this.updateCapabilityValue("alarm_smoke", false);
        } else {
          width++;
        }
      }
    }

    if (device["data"]["density"]) {
      this.updateCapabilityValue("measure_smoke_density", parseInt(device["data"]["density"]));
    }

    let gateways = Homey.app.mihub.gateways;
    for (let sid in gateways) {
      gateways[sid]["childDevices"].forEach(deviceSid => {
        if (this.data.sid == deviceSid) {
          this.setSettings({
            deviceFromGatewaySid: sid
          });
        }
      });
    }

    this.setSettings({
      deviceSid: device.sid,
      deviceModelName: "lumi.sensor_" + device.model,
      deviceModelCodeName: device.modelCode
    });
  }

  registerAuthChangeListener() {
    Homey.app.mihub.on("gatewaysList", this.initialize);
  }

  registerStateChangeListener() {
    Homey.app.mihub.on(`${this.data.sid}`, this.handleStateChange);
  }

  unregisterAuthChangeListener() {
    Homey.app.mihub.removeListener("gatewaysList", this.initialize);
  }

  unregisterStateChangeListener() {
    Homey.app.mihub.removeListener(`${this.data.sid}`, this.handleStateChange);
  }

  updateCapabilityValue(name, value, trigger) {
    if (this.getCapabilityValue(name) != value) {
      this.setCapabilityValue(name, value)
        .then(() => {
          this.log("[" + this.data.sid + "]" + " [" + name + "] [" + value + "] Capability successfully updated");
        })
        .catch(error => {
          this.log("[" + this.data.sid + "]" + " [" + name + "] [" + value + "] Capability not updated because there are errors: " + error.message);
        });
      this.triggerFlow(trigger, name, value);
    }
  }

  triggerFlow(trigger, name, value) {
    if (!trigger) {
      return;
    }

    this.log("trigger:", name, value);

    switch (name) {
      case "alarm_ch4":
    }
  }

  onAdded() {
    this.log("Device added");
  }

  onDeleted() {
    this.unregisterAuthChangeListener();
    this.unregisterStateChangeListener();
    this.log("Device deleted deleted");
  }
}

module.exports = SmokeSensor;
