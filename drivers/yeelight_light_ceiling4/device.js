const Homey = require("homey");
const miio = require("miio");
const flows = require("../../lib/flows");

class YeelightJiaoyue650 extends Homey.Device {
  async onInit() {
    this.initialize = this.initialize.bind(this);
    this.driver = this.getDriver();
    this.data = this.getData();
    this.drgb;
    this.brightness;
    this.colorTemperature;
    this.bgColorTemperature;
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
    this.registerDimLevel("dim");
    this.registerHueLevel("light_hue");
    this.registerLightTemperatureLevel("light_temperature");
    this.registerBGOnOffButton("onoff.bg");
    this.registerBGDimLevel("dim.bg");
    this.registerBGLightTemperatureLevel("light_temperature.bg");
  }

  registerActions() {
    const { actions } = this.driver;
    this.registerFavoriteFlowsAction("favorite_flow_ceiling1_lamp", actions.favoriteFlow);
  }

  getYeelightStatus() {
    var that = this;
    miio
      .device({ address: this.getSetting("deviceIP"), token: this.getSetting("deviceToken") })
      .then(device => {
        this.setAvailable();
        this.device = device;

        this.device
          .call("get_prop", ["power", "bright", "ct", "color_mode", "bg_power", "bg_bright", "bg_rgb", "bg_ct", "bg_lmode"])
          .then(result => {
            that.setCapabilityValue("onoff", result[0] === "on" ? true : false);
            that.setCapabilityValue("dim", result[1] / 100);
            that.brightness = result[1] / 100;
            that.colorTemperature = result[2];
            if (result[3] == 2) {
              that.setCapabilityValue("light_mode", "temperature");
            } else {
              that.setCapabilityValue("light_mode", "color");
            }
            that.setCapabilityValue("onoff.bg", result[4] === "on" ? true : false);
            that.setCapabilityValue("dim.bg", result[5] / 100);
            that.drgb = result[6];
            that.bgColorTemperature = result[7];
            if (result[8] == 1) {
              that.setCapabilityValue("light_mode.bg", "color");
            }
          })
          .catch(error => that.log("Sending commmand 'get_prop' error: ", error));

        if (this.drgb != undefined && this.drgb != null) {
          let red = (this.drgb >> 16) & 0xff;
          let green = (this.drgb >> 8) & 0xff;
          let blue = this.drgb & 0xff;
          let hsbc = this.rgb2hsb([red, green, blue]);
          const hue = hsbc[0] / 359;

          this.setCapabilityValue("light_hue", hue);
          this.setCapabilityValue("light_saturation", this.brightness);
        }

        if (this.colorTemperature != undefined && this.colorTemperature != null) {
          var colorTemp = this.normalize(this.colorTemperature, 2700, 6000);

          this.setCapabilityValue("light_temperature", colorTemp);
        }

        if (this.bgColorTemperature != undefined && this.bgColorTemperature != null) {
          var colorTemp = this.normalize(this.bgColorTemperature, 1700, 6500);

          this.setCapabilityValue("light_temperature.bg", colorTemp);
        }

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
        .call("get_prop", ["power", "bright", "ct", "color_mode", "bg_power", "bg_bright", "bg_rgb", "bg_ct", "bg_lmode"])
        .then(result => {
          that.setCapabilityValue("onoff", result[0] === "on" ? true : false);
          that.setCapabilityValue("dim", result[1] / 100);
          that.brightness = result[1] / 100;
          that.colorTemperature = result[2];
          if (result[3] == 2) {
            that.setCapabilityValue("light_mode", "temperature");
          } else {
            that.setCapabilityValue("light_mode", "color");
          }
          that.setCapabilityValue("onoff.bg", result[4] === "on" ? true : false);
          that.setCapabilityValue("dim.bg", result[5] / 100);
          that.drgb = result[6];
          that.bgColorTemperature = result[7];
          if (result[8] == 1) {
            that.setCapabilityValue("light_mode.bg", "color");
          }
        })
        .catch(error => that.log("Sending commmand 'get_prop' error: ", error));

      if (this.drgb != undefined && this.drgb != null) {
        let red = (this.drgb >> 16) & 0xff;
        let green = (this.drgb >> 8) & 0xff;
        let blue = this.drgb & 0xff;
        let hsbc = this.rgb2hsb([red, green, blue]);
        const hue = hsbc[0] / 359;

        this.setCapabilityValue("light_hue", hue);
        this.setCapabilityValue("light_saturation", this.brightness);
      }

      if (this.colorTemperature != undefined && this.colorTemperature != null) {
        var colorTemp = this.normalize(this.colorTemperature, 2700, 6000);

        this.setCapabilityValue("light_temperature", colorTemp);
      }

      if (this.bgColorTemperature != undefined && this.bgColorTemperature != null) {
        var colorTemp = this.normalize(this.bgColorTemperature, 1700, 6500);

        this.setCapabilityValue("light_temperature.bg", colorTemp);
      }
    }, 1000 * interval);
  }

  normalize(value, min, max) {
    var normalized = (value - min) / (max - min);
    return Number(normalized.toFixed(2));
  }

  rgb2hsb(rgb) {
    var hsb = [];
    var rearranged = rgb.slice(0);
    var maxIndex = 0,
      minIndex = 0;
    var tmp;
    for (var i = 0; i < 2; i++) {
      for (var j = 0; j < 2 - i; j++)
        if (rearranged[j] > rearranged[j + 1]) {
          tmp = rearranged[j + 1];
          rearranged[j + 1] = rearranged[j];
          rearranged[j] = tmp;
        }
    }
    for (var i = 0; i < 3; i++) {
      if (rearranged[0] == rgb[i]) minIndex = i;
      if (rearranged[2] == rgb[i]) maxIndex = i;
    }
    hsb[2] = rearranged[2] / 255.0;
    hsb[1] = 1 - rearranged[0] / rearranged[2];
    hsb[0] = maxIndex * 120 + 60 * (rearranged[1] / hsb[1] / rearranged[2] + (1 - 1 / hsb[1])) * ((maxIndex - minIndex + 3) % 3 == 1 ? 1 : -1);
    hsb[0] = (hsb[0] + 360) % 360;
    return hsb;
  }

  onSettings(oldSettings, newSettings, changedKeys, callback) {
    if (changedKeys.includes("updateTimer") || changedKeys.includes("deviceIP") || changedKeys.includes("smooth") || changedKeys.includes("deviceToken")) {
      this.getYeelightStatus();
      callback(null, true);
    }
  }

  registerOnOffButton(name) {
    this.registerCapabilityListener(name, async value => {
      this.device
        .call("set_power", [value ? "on" : "off", "smooth", this.getSetting("smooth") * 1000])
        .then(() => this.log("Sending " + name + " commmand: " + value + " with " + this.getSetting("smooth") + " smooth"))
        .catch(error => this.log("Sending commmand 'set_power' error: ", error));
    });
  }

  registerDimLevel(name) {
    this.registerCapabilityListener(name, async value => {
      if (value * 100 > 0) {
        this.device
          .call("set_bright", [value * 100])
          .then(() => this.log("Sending " + name + " commmand: " + value))
          .catch(error => this.log("Sending commmand 'set_bright' error: ", error));
      }
    });
  }

  registerHueLevel(name) {
    this.registerCapabilityListener(name, async value => {
      let rgbToSend = this.hsb2rgb([value * 359, 1, 1]);
      let argbToSend = rgbToSend[0] * 65536 + rgbToSend[1] * 256 + rgbToSend[2];
      this.device
        .call("bg_set_rgb", [argbToSend])
        .then(() => this.log("Sending " + name + " commmand: " + argbToSend))
        .catch(error => this.log("Sending commmand 'bg_set_rgb' error: ", error));
    });
  }

  registerBGOnOffButton(name) {
    this.registerCapabilityListener(name, async value => {
      this.device
        .call("bg_set_power", [value ? "on" : "off"])
        .then(() => this.log("Sending " + name + " commmand: " + value))
        .catch(error => this.log("Sending commmand 'bg_set_power' error: ", error));
    });
  }

  registerBGDimLevel(name) {
    this.registerCapabilityListener(name, async value => {
      if (value * 100 > 0) {
        this.device
          .call("bg_set_bright", [value * 100])
          .then(() => this.log("Sending " + name + " commmand: " + value))
          .catch(error => this.log("Sending commmand 'bg_set_bright' error: ", error));
      }
    });
  }

  hsb2rgb(hsb) {
    let rgb = [];
    for (let offset = 240, i = 0; i < 3; i++, offset -= 120) {
      let x = Math.abs(((hsb[0] + offset) % 360) - 240);
      if (x <= 60) rgb[i] = 255;
      else if (60 < x && x < 120) rgb[i] = (1 - (x - 60) / 60) * 255;
      else rgb[i] = 0;
    }
    for (let i = 0; i < 3; i++) rgb[i] += (255 - rgb[i]) * (1 - hsb[1]);
    for (let i = 0; i < 3; i++) rgb[i] *= hsb[2];
    for (let i = 0; i < 3; i++) rgb[i] = Math.round(rgb[i]);
    return rgb;
  }

  registerLightTemperatureLevel(name) {
    this.registerCapabilityListener(name, async value => {
      let color_temp = this.denormalize(value, 1700, 6500);
      this.device
        .call("set_ct_abx", [color_temp, "smooth", 500])
        .then(() => this.log("Sending " + name + " commmand: " + color_temp))
        .catch(error => this.log("Sending commmand 'set_ct_abx' error: ", error));
    });
  }

  registerBGLightTemperatureLevel(name) {
    this.registerCapabilityListener(name, async value => {
      let color_temp = this.denormalize(value, 1700, 6500);
      this.device
        .call("bg_set_ct_abx", [color_temp, "smooth", 500])
        .then(() => this.log("Sending " + name + " commmand: " + color_temp))
        .catch(error => this.log("Sending commmand 'bg_set_ct_abx' error: ", error));
    });
  }

  denormalize(normalized, min, max) {
    var denormalized = (1 - normalized) * (max - min) + min;
    return Number(denormalized.toFixed(0));
  }

  registerFavoriteFlowsAction(name, action) {
    var that = this;
    action.favoriteFlow.registerRunListener(async (args, state) => {
      try {
        miio
          .device({
            address: args.device.getSetting("deviceIP"),
            token: args.device.getSetting("deviceToken")
          })
          .then(device => {
            device
              .call("start_cf", flows[args.favoriteFlowID])
              .then(() => {
                this.log("Set flow: ", args.favoriteFlowID);
                device.destroy();
              })
              .catch(error => {
                this.log("Set flow error: ", error);
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

module.exports = YeelightJiaoyue650;
