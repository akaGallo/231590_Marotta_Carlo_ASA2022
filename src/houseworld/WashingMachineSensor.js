const Clock = require("../utils/Clock")
const Goal = require("../bdi/Goal")
const Intention = require("../bdi/Intention")

class SenseWashingMachineGoal extends Goal {}

class SenseWashingMachineIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SenseWashingMachineGoal;
    }

    *exec({washingMachine: wm} = parameters) {
        yield new Promise(async (res) => {
            while (true) {
                let status = await wm.notifyChange("status");
                this.log("Sensor: " + wm.name + " washing machine is " + status);
                this.agent.beliefs.declare(wm.name + " washing machine is on", status == "on");
                this.agent.beliefs.declare(wm.name + " washing machine is off", status == "off");
            }
        });
    }
}
  
class SenseTurnOnWashingMachineGoal extends Goal {}

class SenseTurnOnWashingMachineIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SenseTurnOnWashingMachineGoal;
    }

    *exec({washingMachine: wm} = parameters) {
        let washingMachineGoalPromise = new Promise(async(resolve, reject) => {
            while (true) {
                await Clock.global.notifyAnyChange();
                if (wm.status === "on") {
                    console.log(wm.name + " washing machine is starting");
                    resolve("Finish");
                    break;
                }
            }
        });
        yield Promise.race([washingMachineGoalPromise]);
        if (this.agent.beliefs.check(wm.name + " washing machine is off"))
            throw new Error("Failed, the washing machine is not working");
    }
}

class SenseRunningWashingMachineGoal extends Goal {}

class SenseRunningWashingMachineIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SenseRunningWashingMachineGoal;
    }
    
    *exec({washingMachine: wm} = parameters) {
        let washingMachineGoalPromise = new Promise(async(resolve, reject) => {
            while (true) {
                let value = await wm.notifyChange("cycleTime");
                if (value != 0) {
                    let startingTime = Clock.globalTimeInMinutes();
                    while (true) {
                        await Clock.global.notifyAnyChange();
                        if (Clock.globalTimeInMinutes() - startingTime === wm.cycleTime) {
                            resolve("Finish");
                            break;
                        }
                    }
                    wm.cycleTime = 0;
                }
            }
        });
        yield Promise.race([washingMachineGoalPromise]);
        if (wm.status === "off")
            throw new Error("Failed, the washing machine is not working");
    }
}

class SenseTurnOffWashingMachineGoal extends Goal {}

class SenseTurnOffWashingMachineIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SenseTurnOffWashingMachineGoal;
    }

    *exec({washingMachine: wm} = parameters) {
        let washingMachineGoalPromise = new Promise(async(resolve, reject) => {
            while (true) {
                await Clock.global.notifyAnyChange();
                if (wm.status === "on" && wm.cycleTime === 0) {
                    console.log(wm.name + " washing machine cycle is over");
                    resolve("Finish");
                    break;
                }
            }
        });
        yield Promise.race([washingMachineGoalPromise]);
        if (this.agent.beliefs.check(wm.name + " washing machine is off"))
            throw new Error("Failed, the washing machine is already turned off");
        return yield wm.turnOffWashingMachine();
    }
}

module.exports = {
    SenseWashingMachineGoal, SenseWashingMachineIntention,
    SenseTurnOnWashingMachineGoal, SenseTurnOnWashingMachineIntention,
    SenseRunningWashingMachineGoal, SenseRunningWashingMachineIntention,
    SenseTurnOffWashingMachineGoal, SenseTurnOffWashingMachineIntention
};