const Homey = require("homey");

class AqaraLock1 extends Homey.Device {
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
    const { triggers } = this.driver;
    const fingersId = [
      "65536",
      "65537",
      "65538",
      "65539",
      "65540",
      "65541",
      "65542",
      "65543",
      "65544",
      "65545",
      "65546",
      "65547",
      "65548",
      "65549",
      "65550",
      "65551",
      "65552",
      "65553",
      "65554",
      "65555",
      "65556",
      "65557",
      "65558",
      "65559",
      "65560",
      "65561",
      "65562",
      "65563",
      "65564",
      "65565",
      "65566",
      "65567",
      "65568",
      "65569",
      "65570",
      "65571",
      "65572",
      "65573",
      "65574",
      "65575",
      "65576",
      "65577",
      "65578",
      "65579",
      "65580",
      "65581",
      "65582",
      "65583",
      "65584",
      "65585",
      "65586",
      "65587",
      "65588",
      "65589",
      "65590",
      "65591",
      "65592",
      "65593",
      "65594",
      "65595",
      "65596",
      "65597",
      "65598",
      "65599",
      "65600",
      "65601",
      "65602",
      "65603",
      "65604",
      "65605",
      "65606",
      "65607",
      "65608",
      "65609",
      "65610",
      "65611",
      "65612",
      "65613",
      "65614",
      "65615",
      "65616",
      "65617",
      "65618",
      "65619",
      "65620",
      "65621",
      "65622",
      "65623",
      "65624",
      "65625",
      "65626",
      "65627",
      "65628",
      "65629",
      "65630",
      "65631",
      "65632",
      "65633",
      "65634",
      "65635"
    ];
    const codesId = [
      "131072",
      "131073",
      "131074",
      "131075",
      "131076",
      "131077",
      "131078",
      "131079",
      "131080",
      "131081",
      "131082",
      "131083",
      "131084",
      "131085",
      "131086",
      "131087",
      "131088",
      "131089",
      "131090",
      "131091",
      "131092",
      "131093",
      "131094",
      "131095",
      "131096",
      "131097",
      "131098",
      "131099",
      "131100",
      "131101",
      "131102",
      "131103",
      "131104",
      "131105",
      "131106",
      "131107",
      "131108",
      "131109",
      "131110",
      "131111",
      "131112",
      "131113",
      "131114",
      "131115",
      "131116",
      "131117",
      "131118",
      "131119",
      "131120",
      "131121",
      "131122",
      "131123",
      "131124",
      "131125",
      "131126",
      "131127",
      "131128",
      "131129",
      "131130",
      "131131",
      "131132",
      "131133",
      "131134",
      "131135",
      "131136",
      "131137",
      "131138",
      "131139",
      "131140",
      "131141",
      "131142",
      "131143",
      "131144",
      "131145",
      "131146",
      "131147",
      "131148",
      "131149",
      "131150",
      "131151",
      "131152",
      "131153",
      "131154",
      "131155",
      "131156",
      "131157",
      "131158",
      "131159",
      "131160",
      "131161",
      "131162",
      "131163",
      "131164",
      "131165",
      "131166",
      "131167",
      "131168",
      "131169",
      "131170",
      "131171"
    ];
    const cardsId = [
      "196608",
      "196609",
      "196610",
      "196611",
      "196612",
      "196613",
      "196614",
      "196615",
      "196616",
      "196617",
      "196618",
      "196619",
      "196620",
      "196621",
      "196622",
      "196623",
      "196624",
      "196625",
      "196626",
      "196627",
      "196628",
      "196629",
      "196630",
      "196631",
      "196632",
      "196633",
      "196634",
      "196635",
      "196636",
      "196637",
      "196638",
      "196639",
      "196640",
      "196641",
      "196642",
      "196643",
      "196644",
      "196645",
      "196646",
      "196647",
      "196648",
      "196649",
      "196650",
      "196651",
      "196652",
      "196653",
      "196654",
      "196655",
      "196656",
      "196657",
      "196658",
      "196659",
      "196660",
      "196661",
      "196662",
      "196663",
      "196664",
      "196665",
      "196666",
      "196667",
      "196668",
      "196669",
      "196670",
      "196671",
      "196672",
      "196673",
      "196674",
      "196675",
      "196676",
      "196677",
      "196678",
      "196679",
      "196680",
      "196681",
      "196682",
      "196683",
      "196684",
      "196685",
      "196686",
      "196687",
      "196688",
      "196689",
      "196690",
      "196691",
      "196692",
      "196693",
      "196694",
      "196695",
      "196696",
      "196697",
      "196698",
      "196699",
      "196700",
      "196701",
      "196702",
      "196703",
      "196704",
      "196705",
      "196706",
      "196707"
    ];

    if (device["data"]["voltage"]) {
      var battery = (device["data"]["voltage"] - 2800) / 5;
      this.updateCapabilityValue("measure_battery", battery > 100 ? 100 : battery);
      this.updateCapabilityValue("alarm_battery", battery <= 20 ? true : false);
    }

    var settings = this.getSettings();

    if (device["data"]["fing_verified"]) {
      this.updateCapabilityValue("alarm_motion.finger", true);
      var that = this;
      fingersId.forEach(function(item, i, arr) {
        if (device["data"]["fing_verified"] == item) {
          for (let u = 0; u < 10; u++) {
            if (settings[`user${u}FingerID`]) {
              let userFingers = settings[`user${u}FingerID`];
              let userFingersArray = userFingers.split(",");
              let maxNumber = Math.max.apply(null, userFingersArray);
              for (let UNF = 0; UNF <= maxNumber; UNF++) {
                if (i == userFingersArray[UNF]) {
                  let userUN = settings[`lock${u}UserName`];
                  let tokens = {
                    finger_id: i,
                    code_id: 404,
                    card_id: 404,
                    userName: userUN,
                    wrong_id: 0
                  };
                  that.triggerFlow(triggers.lockUsed, "lockUsed", tokens);
                }
              }
            }
          }
        }
      });

      var width = 0;
      var id = setInterval(frame.bind(this), settings.alarm_duration_number);
      function frame() {
        if (width == 1000) {
          clearInterval(id);
          this.updateCapabilityValue("alarm_motion.finger", false);
        } else {
          width++;
        }
      }
    }

    if (device["data"]["psw_verified"]) {
      this.updateCapabilityValue("alarm_motion.code", true);
      var that = this;

      codesId.forEach(function(item, i, arr) {
        if (device["data"]["psw_verified"] == item) {
          for (let u = 0; u < 10; u++) {
            if (settings[`user${u}CodeID`]) {
              let userCodes = settings[`user${u}CodeID`];
              let userCodesArray = userCodes.split(",");
              let maxNumber = Math.max.apply(null, userCodesArray);
              for (let UNCE = 0; UNCE <= maxNumber; UNCE++) {
                if (i == userCodesArray[UNCE]) {
                  let userUN = settings[`lock${u}UserName`];
                  let tokens = {
                    finger_id: 404,
                    code_id: i,
                    card_id: 404,
                    userName: userUN,
                    wrong_id: 0
                  };
                  that.triggerFlow(triggers.lockUsed, "lockUsed", tokens);
                }
              }
            }
          }
        }
      });

      var width = 0;
      var id = setInterval(frame.bind(this), settings.alarm_duration_number);
      function frame() {
        if (width == 1000) {
          clearInterval(id);
          this.updateCapabilityValue("alarm_motion.code", false);
        } else {
          width++;
        }
      }
    }

    if (device["data"]["card_verified"]) {
      this.updateCapabilityValue("alarm_motion.card", true);
      var that = this;
      cardsId.forEach(function(item, i, arr) {
        if (device["data"]["card_verified"] == item) {
          for (let u = 0; u < 10; u++) {
            if (settings[`user${u}CardID`]) {
              let userCards = settings[`user${u}CardID`];
              let userCardsArray = userCards.split(",");
              let maxNumber = Math.max.apply(null, userCardsArray);
              for (let UNCD = 0; UNCD <= maxNumber; UNCD++) {
                if (i == userCardsArray[UNCD]) {
                  let userUN = settings[`lock${u}UserName`];
                  let tokens = {
                    finger_id: 404,
                    code_id: 404,
                    card_id: i,
                    userName: userUN,
                    wrong_id: 0
                  };
                  that.triggerFlow(triggers.lockUsed, "lockUsed", tokens);
                }
              }
            }
          }
        }
      });

      var width = 0;
      var id = setInterval(frame.bind(this), settings.alarm_duration_number);
      function frame() {
        if (width == 1000) {
          clearInterval(id);
          this.updateCapabilityValue("alarm_motion.card", false);
        } else {
          width++;
        }
      }
    }

    if (device["data"]["verified_wrong"]) {
      this.updateCapabilityValue("alarm_motion.wrongID", true);
      var that = this;
      let tokens = {
        finger_id: 404,
        code_id: 404,
        card_id: 404,
        userName: "Not user",
        wrong_id: parseInt(device["data"]["verified_wrong"])
      };
      that.triggerFlow(triggers.lockUsed, "lockUsed", tokens);

      var width = 0;
      var id = setInterval(frame.bind(this), settings.alarm_duration_number);
      function frame() {
        if (width == 1000) {
          clearInterval(id);
          this.updateCapabilityValue("alarm_motion.wrongID", false);
        } else {
          width++;
        }
      }
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

    if (value) {
      trigger.trigger(this, value, true);
    }

    this.log("trigger:", name, value);

    switch (name) {
      case "alarm_motion":
      case "lockUsed":
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

module.exports = AqaraLock1;
