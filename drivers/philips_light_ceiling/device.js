const Homey = require("homey");
const miio = require("miio");

class PhilipsLightCeiling extends Homey.Device {
  async onInit() {
    this.initialize = this.initialize.bind(this);
    this.driver = this.getDriver();
    this.data = this.getData();
    this.brightness;
    this.colorTemperature;
    this.initialize();
    this.log("MiJia device init | " + "name: " + this.getName() + " - " + "class: " + this.getClass() + " - " + "data: " + JSON.stringify(this.data));
  }

  async initialize() {
    this.registerActions();
    this.registerCapabilities();
    this.getYeelightStatus();
  }

  registerCapabilities() {
    this.registerOnOffButton("onoff");
    this.registerBrightnessLevel("dim");
    this.registerLightTemperatureLevel("light_temperature");
  }

  registerActions() {
    const { actions } = this.driver;
    this.registerPhilipsScenesAction("philips_scenes", actions.philipsScenes);
    this.registerPhilipsLightACAction("philips_light_ac", actions.philipsLightAC);
  }

  getYeelightStatus() {
    var that = this;
    miio
      .device({ address: this.getSetting("deviceIP"), token: this.getSetting("deviceToken") })
      .then(device => {
        this.setAvailable();
        this.device = device;

        this.device
          .call("get_prop", ["power", "bright", "cct"])
          .then(result => {
            that.setCapabilityValue("onoff", result[0] === "on" ? true : false);
            that.setCapabilityValue("dim", result[1] / 100);
            that.setCapabilityValue("light_temperature", result[2] / 100);
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
          this.getYeelightStatus();
        }, 10000);
      });
  }

  updateTimer(interval) {
    var that = this;
    clearInterval(this.updateInterval);
    this.updateInterval = setInterval(() => {
      this.device
        .call("get_prop", ["power", "bright", "cct"])
        .then(result => {
          that.setCapabilityValue("onoff", result[0] === "on" ? true : false);
          that.setCapabilityValue("dim", result[1] / 100);
          that.setCapabilityValue("light_temperature", result[2] / 100);
        })
        .catch(error => that.log("Sending commmand 'get_prop' error: ", error));
    }, 1000 * interval);
  }

  onSettings(oldSettings, newSettings, changedKeys, callback) {
    if (changedKeys.includes("updateTimer") || changedKeys.includes("deviceIP") || changedKeys.includes("deviceToken")) {
      this.getYeelightStatus();
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

  registerBrightnessLevel(name) {
    this.registerCapabilityListener(name, async value => {
      if (value * 100 > 0) {
        this.device
          .call("set_bright", [value * 100])
          .then(() => this.log("Sending " + name + " commmand: " + value * 100))
          .catch(error => this.log("Sending commmand 'set_bright' error: ", error));
      }
    });
  }

  registerLightTemperatureLevel(name) {
    this.registerCapabilityListener(name, async value => {
      this.device
        .call("set_cct", [value * 100])
        .then(() => this.log("Sending " + name + " commmand: " + color_temp * 100))
        .catch(error => this.log("Sending commmand 'set_cct' error: ", error));
    });
  }

  registerPhilipsScenesAction(name, action) {
    action.action.registerRunListener(async (args, state) => {
      try {
        miio
          .device({
            address: args.device.getSetting("deviceIP"),
            token: args.device.getSetting("deviceToken")
          })
          .then(device => {
            device
              .call("apply_fixed_scene", [parseInt(args.scene)])
              .then(() => {
                this.log("Set scene: ", args.scene);
                device.destroy();
              })
              .catch(error => {
                this.log("Set scene error: ", error);
                device.destroy();
              });
          })
          .catch(error => {
            this.log("miio connect error: " + error);
          });
      } catch (error) {
        this.log("catch error: " + error);
      }
    });
  }

  registerPhilipsLightACAction(name, action) {
    action.action.registerRunListener(async (args, state) => {
      try {
        miio
          .device({
            address: args.device.getSetting("deviceIP"),
            token: args.device.getSetting("deviceToken")
          })
          .then(device => {
            device
              .call("enable_ac", [args.ac])
              .then(() => {
                this.log("Set Auto Adjust Color Temperature: ", args.ac);
                device.destroy();
              })
              .catch(error => {
                this.log("Set Auto Adjust Color Temperature error: ", error);
                device.destroy();
              });
          })
          .catch(error => {
            this.log("miio connect error: " + error);
          });
      } catch (error) {
        this.log("catch error: " + error);
      }
    });
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

module.exports = PhilipsLightCeiling;
