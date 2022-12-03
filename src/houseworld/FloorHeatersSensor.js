const Clock = require("../utils/Clock")
const Goal = require("../bdi/Goal")
const Intention = require("../bdi/Intention")

class SenseFloorHeatersGoal extends Goal {}

class SenseFloorHeatersIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SenseFloorHeatersGoal;
    }

    *exec({heater} = parameters) {
        var heaterGoals = [];
        for (let h of heater) {
            let heaterGoalPromise = new Promise(async (res) => {
                while (true) {
                    let status = await h.notifyChange("status");
                    this.log("Sensor: " + h.name + " floor heater is switched " + status);
                    this.agent.beliefs.declare(h.name + " floor heater is on", status === "on");
                    this.agent.beliefs.declare(h.name + " floor heater is off", status === "off");
                }
            });
            heaterGoals.push(heaterGoalPromise);
        }
        yield Promise.all(heaterGoals);
    }
}

class SenseTemperatureGoal extends Goal {}

class SenseTemperatureIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SenseTemperatureGoal;
    }

    *exec({heater, high, medium, low} = parameters) {
        var heaterGoals = [];
        for (let h of heater) {
            let heaterGoalPromise = new Promise(async (res) => {
                while (true) {
                    let temp = await h.notifyChange("temperature");
                    let status = "";
                    if (parseFloat(temp) >= high) {
                        status = "high";
                        this.log("Sensor: " + h.name + " temperature is " + status);
                        this.agent.beliefs.declare(h.name + " low temperature", status == "low");
                        this.agent.beliefs.declare(h.name + " medium temperature", status == "medium");
                        this.agent.beliefs.declare(h.name + " high temperature", status == "high");
                    } else if (parseFloat(temp) <= low) {
                        status = "low";
                        this.log("Sensor: " + h.name + " temperature is " + status);
                        this.agent.beliefs.declare(h.name + " low temperature", status == "low");
                        this.agent.beliefs.declare(h.name + " medium temperature", status == "medium");
                        this.agent.beliefs.declare(h.name + " high temperature", status == "high");
                    } else if (parseFloat(temp) === medium) {
                        status = "medium";
                        this.log("Sensor: " + h.name + " temperature is " + status);
                        this.agent.beliefs.declare(h.name + " low temperature", status == "low");
                        this.agent.beliefs.declare(h.name + " medium temperature", status == "medium");
                        this.agent.beliefs.declare(h.name + " high temperature", status == "high");
                    }
                }
            });
            heaterGoals.push(heaterGoalPromise);
        }
        yield Promise.all(heaterGoals);
    }
}

class SenseHeatOccupiedRoomGoal extends Goal {}

class SenseHeatOccupiedRoomIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SenseHeatOccupiedRoomGoal;
    }

    *exec({heater} = parameters) {
        var heaterGoals = [];
        for (let h of heater) {
            let heaterGoalPromise = new Promise(async (res) => {
                while (true) {
                    await Clock.global.notifyAnyChange();
                    if (this.agent.beliefs.check(h.name + " is occupied") &&
                        this.agent.beliefs.check("not " + h.name + " high temperature")) {
                        h.startFloorHeater();
                        while (true) {
                            await Clock.global.notifyAnyChange();
                            if (this.agent.beliefs.check(h.name + " high temperature") ||
                                this.agent.beliefs.check("not " + h.name + " is occupied")) {
                                console.log(h.name + " temperature is " + h.temperature);
                                break;
                            }
                            h.increaseValue(0.1);
                        }
                        h.stopFloorHeater();
                    }
                }
            });
            heaterGoals.push(heaterGoalPromise);
        }
        yield Promise.all(heaterGoals);
    }
}

class SenseMediumTemperatureUnoccupiedRoomGoal extends Goal {}

class SenseMediumTemperatureUnoccupiedRoomIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SenseMediumTemperatureUnoccupiedRoomGoal;
    }

    *exec({heater} = parameters) {
        var heaterGoals = [];
        for (let h of heater) {
            let heaterGoalPromise = new Promise(async (res) => {
                while (true) {
                    await Clock.global.notifyAnyChange();
                    if (this.agent.beliefs.check("not " + h.name + " is occupied") && parseFloat(h.temperature) > 20) {
                        while (true) {
                            await Clock.global.notifyAnyChange();
                            if (this.agent.beliefs.check(h.name + " is occupied") || parseFloat(h.temperature) === 20) {
                                console.log(h.name + " temperature is " + h.temperature);
                                break;
                            }
                            h.increaseValue(-0.1);
                        }
                    }
                }
            });
            heaterGoals.push(heaterGoalPromise);
        }
        yield Promise.all(heaterGoals);
    }
}

class SenseLowTemperatureUnoccupiedRoomGoal extends Goal {}

class SenseLowTemperatureUnoccupiedRoomIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SenseLowTemperatureUnoccupiedRoomGoal;
    }

    *exec({heater, unoccupationTime} = parameters) {
        var heaterGoals = [];
        for (let h of heater) {
            let heaterGoalPromise = new Promise(async (res) => {
                while (true) {
                    await Clock.global.notifyAnyChange();
                    if (this.agent.beliefs.check("not " + h.name + " is occupied") &&
                        this.agent.beliefs.check("not " + h.name + " low temperature")) {
                        let startingTime = Clock.globalTimeInMinutes();
                        while (true) {
                            await Clock.global.notifyAnyChange();
                            if (this.agent.beliefs.check(h.name + " is occupied") ||
                                this.agent.beliefs.check(h.name + " low temperature")) {
                                break;
                            } else if (Clock.globalTimeInMinutes() - startingTime >= unoccupationTime) {
                                while (true) {
                                    await Clock.global.notifyAnyChange();
                                    if (this.agent.beliefs.check(h.name + " low temperature") ||
                                        this.agent.beliefs.check(h.name + " is occupied")) {
                                        console.log(h.name + " temperature is " + h.temperature);
                                        break;
                                    }
                                    h.increaseValue(-0.1);
                                }
                            }
                        }
                    }
                }
            });
            heaterGoals.push(heaterGoalPromise);
        }
        yield Promise.all(heaterGoals);
    }
}

module.exports = {
    SenseFloorHeatersGoal, SenseFloorHeatersIntention,
    SenseTemperatureGoal, SenseTemperatureIntention,
    SenseHeatOccupiedRoomGoal, SenseHeatOccupiedRoomIntention,
    SenseMediumTemperatureUnoccupiedRoomGoal, SenseMediumTemperatureUnoccupiedRoomIntention,
    SenseLowTemperatureUnoccupiedRoomGoal, SenseLowTemperatureUnoccupiedRoomIntention
}