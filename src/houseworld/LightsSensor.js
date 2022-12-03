const Clock = require("../utils/Clock")
const Goal = require("../bdi/Goal")
const Intention = require("../bdi/Intention")

class SenseLightsGoal extends Goal {}

class SenseLightsIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SenseLightsGoal;
    }

    *exec({lights} = parameters) {
        var lightsGoals = [];
        for (let l of lights) {
            let lightGoalPromise = new Promise(async (res) => {
                while (true) {
                    let status = await l.notifyChange("status");
                    this.log("Sensor: " + l.name + " light is switched " + status);
                    this.agent.beliefs.declare(l.name + " light is on", status == "on");
                    this.agent.beliefs.declare(l.name + " light is off", status == "off");
                    this.agent.beliefs.declare(l.name + " light is on manually", status == "on manually");
                    this.agent.beliefs.declare(l.name + " light is off manually", status == "off manually");
                }
            });
            lightsGoals.push(lightGoalPromise);
        }
        yield Promise.all(lightsGoals);
    }
}

class SenseIntensityGoal extends Goal {}

class SenseIntensityIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SenseIntensityGoal;
    }

    *exec({lights, low, high} = parameters) {
        var lightGoals = [];
        for (let l of lights) {
            let lightGoalPromise = new Promise(async (res) => {
                while (true) {
                    let intensity = await l.notifyChange("intensity");
                    let status = "";
                    if (intensity >= high) {
                        status = "high";
                    } else if (intensity <= low) {
                        status = "low";
                    } else {
                        status = "medium";
                    }
                    this.log("Sensor: " + l.name + " light intensity is " + status);
                    this.agent.beliefs.declare(l.name + " low light", status == "low");
                    this.agent.beliefs.declare(l.name + " medium light", status == "medium");
                    this.agent.beliefs.declare(l.name + " high light", status == "high");
                }
            });
            lightGoals.push(lightGoalPromise);
        }
        yield Promise.all(lightGoals);
    }
}

class SenseAutoLightRoomOccupancyGoal extends Goal {}

class SenseAutoLightRoomOccupancyIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SenseAutoLightRoomOccupancyGoal;
    }

    *exec({lights} = parameters) {
        var lightGoals = [];
        for (let l of lights) {
            let lightGoalPromise = new Promise(async (res) => {
                while (true) {
                    await Clock.global.notifyAnyChange();
                    if (this.agent.beliefs.check(l.name + " is occupied") && l.status === "off") {
                        this.agent.postSubGoal(new SenseAutoTurnOnLightGoal({ light: l }));
                    } else if (this.agent.beliefs.check("not " + l.name + " is occupied") && l.status !== "off") {
                        this.agent.postSubGoal(new SenseAutoTurnOffLightGoal({ light: l }));
                    }
                }
            });
            lightGoals.push(lightGoalPromise);
        }
        yield Promise.all(lightGoals);
    }
}
    

class SenseAutoTurnOnLightGoal extends Goal {}

class SenseAutoTurnOnLightIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SenseAutoTurnOnLightGoal;
    }

    *exec({light} = parameters) {
        if (this.agent.beliefs.check(light.name + " light is on") ||
            this.agent.beliefs.check(light.name + " light is on manually") ||
            this.agent.beliefs.check(light.name + " light is off manually"))
            throw new Error("Failed, " + light.name + " light is already on");
        return yield light.switchOnLight();
    }
}

class SenseAutoTurnOffLightGoal extends Goal {}

class SenseAutoTurnOffLightIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SenseAutoTurnOffLightGoal;
    }

    *exec({light} = parameters) {
        if (this.agent.beliefs.check(light.name + " light is off"))
            throw new Error("Failed, " + light.name + " light is already off");
        return yield light.switchOffLight();
    }
}

class SenseSetIntensityManuallyGoal extends Goal {}

class SenseSetIntensityManuallyIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SenseSetIntensityManuallyGoal;
    }

    *exec({light, hh, mm, intensityToAdd} = parameters) {
        while (true) {
            Clock.global.notifyChange('mm');
            yield;
            if (light.name + " is occupied") {
                if (Clock.global.hh == hh && Clock.global.mm == mm) {
                    if (intensityToAdd > 0) {
                        yield light.increaseIntensityManually(intensityToAdd);
                        break;
                    } else if (intensityToAdd < 0) {
                        yield light.decreaseIntensityManually(intensityToAdd);
                        break;
                    }
                }
            } else {
                throw new Error("Failed, " + light.name + " is not occupied");
            }
        }
    }
}

module.exports = {
    SenseLightsGoal, SenseLightsIntention,
    SenseIntensityGoal, SenseIntensityIntention,
    SenseAutoLightRoomOccupancyGoal, SenseAutoLightRoomOccupancyIntention,
    SenseAutoTurnOnLightIntention,
    SenseAutoTurnOffLightIntention,
    SenseSetIntensityManuallyGoal, SenseSetIntensityManuallyIntention
};  