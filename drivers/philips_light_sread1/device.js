const Homey = require("homey");
const miio = require("miio");
const flows = require("../../lib/flows");

class YeelightWhiteBulb extends Homey.Device {
  async onInit() {
    this.initialize = this.initialize.bind(this);
    this.driver = this.getDriver();
    this.data = this.getData();
    this.brightness;
    this.initialize();
    this.log("MiJia device init | " + "name: " + this.getName() + " - " + "class: " + this.getClass() + " - " + "data: " + JSON.stringify(this.data));
  }

  async initialize() {
    this.registerActions();
    this.registerCapabilities();
    this.getYeelightStatus();
  }

  registerCapabilities() {
    const { triggers } = this.driver;
    this.registerOnOffButton("onoff");
    this.registerBrightnessLevel("dim");
    this.registerEyeCareButton("onoff.eyecare");
    this.registerAmbilightButton("onoff.ambilight");
    this.registerAmbilightLevel("dim.ambilight");
  }

  registerActions() {
    const { actions } = this.driver;
    this.registerAmbilightLevelAction("ambilight_level", actions.ambilightLevel);
    this.registerEyecareSceneAction("eyecare_scene", actions.eyecareScene);
  }

  getYeelightStatus() {
    var that = this;
    miio
      .device({ address: this.getSetting("deviceIP"), token: this.getSetting("deviceToken") })
      .then(device => {
        this.setAvailable();
        this.device = device;

        this.device
          .call("get_prop", ["power", "bright", "ambstatus", "eyecare"])
          .then(result => {
            that.setCapabilityValue("onoff", result[0] === "on" ? true : false);
            that.setCapabilityValue("dim", result[1] / 100);
            that.brightness = result[1] / 100;
            that.setCapabilityValue("onoff.ambilight", result[2] === "on" ? true : false);
            that.setCapabilityValue("onoff.eyecare", result[3] === "on" ? true : false);
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
        .call("get_prop", ["power", "bright", "ambstatus", "eyecare"])
        .then(result => {
          that.setCapabilityValue("onoff", result[0] === "on" ? true : false);
          that.setCapabilityValue("dim", result[1] / 100);
          that.brightness = result[1] / 100;
          that.setCapabilityValue("onoff.ambilight", result[2] === "on" ? true : false);
          that.setCapabilityValue("onoff.eyecare", result[3] === "on" ? true : false);
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
          .then(() => this.log("Sending " + name + " commmand: " + value))
          .catch(error => this.log("Sending commmand 'set_bright' error: ", error));
      }
    });
  }

  registerEyeCareButton(name) {
    this.registerCapabilityListener(name, async value => {
      this.device
        .call("set_eyecare", [value ? "on" : "off"])
        .then(() => this.log("Sending " + name + " commmand: " + value))
        .catch(error => this.log("Sending commmand 'set_eyecare' error: ", error));
    });
  }

  registerAmbilightButton(name) {
    this.registerCapabilityListener(name, async value => {
      this.device
        .call("enable_amb", [value ? "on" : "off"])
        .then(() => this.log("Sending " + name + " commmand: " + value))
        .catch(error => this.log("Sending commmand 'enable_amb' error: ", error));
    });
  }

  registerAmbilightLevel(name) {
    this.registerCapabilityListener(name, async value => {
      if (value * 100 > 0) {
        this.device
          .call("set_amb_bright", [value * 100])
          .then(() => this.log("Sending " + name + " commmand: " + value))
          .catch(error => this.log("Sending commmand 'set_amb_bright' error: ", error));
      }
    });
  }

  registerAmbilightLevelAction(name, action) {
    action.action.registerRunListener(async (args, state) => {
      try {
        miio
          .device({
            address: args.device.getSetting("deviceIP"),
            token: args.device.getSetting("deviceToken")
          })
          .then(device => {
            device
              .call("set_amb_bright", [args.level * 100])
              .then(() => {
                this.log("Set ambilight: ", args.level * 100);
                device.destroy();
              })
              .catch(error => {
                this.log("Set ambilight error: ", error);
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

  registerEyecareSceneAction(name, action) {
    action.action.registerRunListener(async (args, state) => {
      try {
        miio
          .device({
            address: args.device.getSetting("deviceIP"),
            token: args.device.getSetting("deviceToken")
          })
          .then(device => {
            device
              .call("set_user_scene", [args.scene])
              .then(() => {
                this.log("Set eyecare scene: ", args.scene);
                device.destroy();
              })
              .catch(error => {
                this.log("Set eyecare error: ", error);
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

module.exports = YeelightWhiteBulb;
