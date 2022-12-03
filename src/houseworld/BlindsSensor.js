const Clock = require("../utils/Clock")
const Goal = require("../bdi/Goal")
const Intention = require("../bdi/Intention")

class SenseBlindsGoal extends Goal {}

class SenseBlindsIntention extends Intention {  
    static applicable(goal) {
        return goal instanceof SenseBlindsGoal;
    }

    *exec({blinds} = parameters) {
        var blindsGoals = [];
        for (let b of blinds) {
            let blindsGoalPromise = new Promise(async res => {
                while (true) {
                    let status = await b.notifyChange("status");
                    this.log("Sensor: " + b.name + " blind is " + status);
                    this.agent.beliefs.declare(b.name + " blind is open", status == "open");
                    this.agent.beliefs.declare(b.name + " blind is close", status == "close");
                }
            });
            blindsGoals.push(blindsGoalPromise);
        }
        yield Promise.all(blindsGoals);
    }
}

class SenseRaiseBlindsGoal extends Goal {}

class SenseRaiseBlindsIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SenseRaiseBlindsGoal;
    }
    
    *exec({blinds} = parameters) {
        var blindsGoals = [];
        for (let b of blinds) {
            let blindsGoalPromise = new Promise(async (resolve, reject) => {
                while (true) {
                    let raisingTime = await b.notifyChange("spanTime");
                    if (b.status === "open" && raisingTime != 0) {
                        let startingTime = Clock.globalTimeInMinutes();
                        while (true) {
                            await Clock.global.notifyAnyChange();
                            if (Clock.globalTimeInMinutes() - startingTime === raisingTime) {
                                resolve("Finish");
                                console.log(b.name + " blind is completely raised");
                                break;
                            }    
                        }
                        b.spanTime = 0;
                    }
                }
            });
            blindsGoals.push(blindsGoalPromise);
        }
        yield Promise.all(blindsGoals);
        for (let b of blinds) {
            if (b.status === "close")
                throw new Error("Failed, " + b.name + " blind is not working");
        }
   }
}

class SenseLowerBlindsGoal extends Goal {}

class SenseLowerBlindsIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SenseLowerBlindsGoal;
    }

    *exec({blinds} = parameters) {
        var blindsGoals = [];
        for (let b of blinds) {
            let blindsGoalPromise = new Promise(async (resolve, reject) => {
                while (true) {
                    await Clock.global.notifyAnyChange();
                    let loweringTime = b.spanTime;
                    if (b.status === "close" && loweringTime != 0) {
                        let startingTime = Clock.globalTimeInMinutes();
                        while (true) {
                            await Clock.global.notifyAnyChange();
                            if (Clock.globalTimeInMinutes() - startingTime === loweringTime) {
                                resolve("Finish");
                                console.log(b.name + " blind is completely lowered");
                                break;
                            }    
                        }
                        b.spanTime = 0;
                    }
                }
            });
            blindsGoals.push(blindsGoalPromise);
        }
        yield Promise.all(blindsGoals);
        for (let b of blinds) {
            if (b.status === "open")
                throw new Error("Failed, " + b.name + " blind is not working");
        }
    }
}

module.exports = {
    SenseBlindsGoal, SenseBlindsIntention,
    SenseRaiseBlindsGoal, SenseRaiseBlindsIntention,
    SenseLowerBlindsGoal, SenseLowerBlindsIntention
}