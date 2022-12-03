const Clock = require("../utils/Clock")
const Goal = require("../bdi/Goal")
const Intention = require("../bdi/Intention")

class SenseCarChargerGoal extends Goal {}

class SenseCarChargerIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SenseCarChargerGoal;
    }

    *exec({carCharger: cc} = parameters) {
        yield new Promise(async (res) => {
            while (true) {
                let status = await cc.notifyChange("status");
                this.log("Sensor: " + cc.name + " e-car charger is " + status);
                this.agent.beliefs.declare(cc.name + " e-car charger is on", status == "on");
                this.agent.beliefs.declare(cc.name + " e-car charger is off", status == "off");
            }
        });
    }
}

class SenseStartCarChargingGoal extends Goal {}

class SenseStartCarChargingIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SenseStartCarChargingGoal;
    }

    *exec({carCharger: cc} = parameters) {
        let carChargerGoalPromise = new Promise(async(resolve, reject) => {
            while (true) {
                await Clock.global.notifyAnyChange();
                if (cc.status === "on") {
                    console.log(cc.name + " e-car is charging");
                    resolve("Finish");
                    break;
                }
            }
        });
        yield Promise.race([carChargerGoalPromise]);
        if (this.agent.beliefs.check(cc.name + " e-car charger is off"))
            throw new Error("Failed, e-car charger is not working");
    }
}

class SenseFullBatteryChargingGoal extends Goal {}

class SenseFullBatteryChargingIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SenseFullBatteryChargingGoal;
    }

    *exec({carCharger: cc} = parameters) {
        let carChargerGoalPromise = new Promise(async(resolve, reject) => {
            while (true) {
                let value = await cc.notifyChange("battery");
                if (cc.status === "on") {
                    let batteryToCharge = 100 - value;
                    let chargingTime = 4.8 * batteryToCharge;
                    let startingTime = Clock.globalTimeInMinutes();
                    while (true) {
                        await Clock.global.notifyAnyChange();
                        if (Clock.globalTimeInMinutes() - startingTime === chargingTime) {
                            console.log(cc.type + " e-car battery is full");
                            break;
                        }
                    }
                    cc.battery = 100;
                    resolve("Finish");
                    break;
                }
            }
        });
        yield Promise.race([carChargerGoalPromise]);
        if (cc.status === "off")
            throw new Error("Failed, the e-car charging is not working");
    }
}

class SenseStopCarChargingGoal extends Goal {}

class SenseStopCarChargingIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SenseStopCarChargingGoal;
    }

    *exec({carCharger: cc} = parameters) {
        let carChargerGoalPromise = new Promise(async(resolve, reject) => {
            while (true) {
                await Clock.global.notifyAnyChange();
                if (cc.status === "on" && cc.battery === 100) {
                    console.log(cc.name + " e-car charging is complete");
                    resolve("Finish");
                    break;
                }
            }
        });
        yield Promise.race([carChargerGoalPromise]);
        if (this.agent.beliefs.check(cc.name + " e-car charger is off"))
            throw new Error("Failed, the e-car charging is already stopped");
        return yield cc.stopCharge();
    }
}

module.exports = {
    SenseCarChargerGoal, SenseCarChargerIntention,
    SenseStartCarChargingGoal, SenseStartCarChargingIntention,
    SenseFullBatteryChargingGoal, SenseFullBatteryChargingIntention,
    SenseStopCarChargingGoal, SenseStopCarChargingIntention
};