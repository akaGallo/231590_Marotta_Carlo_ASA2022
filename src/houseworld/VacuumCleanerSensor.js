const Clock = require('../utils/Clock')
const Goal = require('../bdi/Goal')
const Intention = require('../bdi/Intention')
const pddlActionIntention = require('../pddl/actions/pddlActionIntention')

class SenseBatteryGoal extends Goal {}

class SenseBatteryIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SenseBatteryGoal;
    }
    
    *exec({vacuumCleaner: vc} = parameters) {
        yield new Promise(async (res) => {
            while (true) {
                let battery = await vc.notifyChange("battery");
                this.agent.beliefs.declare("highCharge", battery >= 70);
                this.agent.beliefs.declare("mediumCharge", battery > 30 && battery < 70);
                this.agent.beliefs.declare("lowCharge", battery <= 30);
            }
        });
    }
}

class SenseVacuumCleanerPositionGoal extends Goal {}

class SenseVacuumCleanerPositionIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SenseVacuumCleanerPositionGoal;
    }
    
    *exec({vacuumCleaner: vc} = parameters) {
        yield new Promise(async (res) => {
            while (true) {
                let position = await vc.notifyChange("inRoom");
                this.agent.beliefs.declare("inRoom " + position, position);
            }
        });
    }
}

class SenseCleanRoomGoal extends Goal {}

class SenseCleanRoomIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SenseCleanRoomGoal;
    }
    
    *exec({rooms} = parameters) {
        while (true) {
            for (let r in rooms) {
                yield;
                this.agent.beliefs.declare("cleaned " + rooms[r].name, rooms[r].cleaned);
            }
        }
    }
}

class MoveGoal extends Goal {}

class Move extends pddlActionIntention {
    static parameters = ["from", "to"];
    static precondition = [["inRoom", "from"], ["door", "from", "to"]];
    static effect = [["not inRoom", "from"], ["inRoom", "to"]];

    static applicable (goal) {
        return goal instanceof MoveGoal;
    }

    *exec ({to} = parameters) {
        if (this.checkPrecondition()) {
            yield this.agent.device.moveToRoom(to);
            this.applyEffect();
        } else {
            throw new Error("Pddl precondition not valid");
        }
    }
}

class FirstChargeCleanGoal extends Goal {}

class FirstChargeClean extends pddlActionIntention {
    static parameters = ["r"];
    static precondition = [["inRoom", "r"], ["highCharge"]];
    static effect = [["cleaned", "r"], ["mediumCharge"], ["not highCharge"]];

    static applicable (goal) {
        return goal instanceof FirstChargeCleanGoal;
    }

    *exec() {
        if (this.checkPrecondition()) {
            yield this.agent.device.cleanRoom();
            this.applyEffect();
        } else {
            throw new Error("Pddl precondition not valid");
        }
    }
}

class SecondChargeCleanGoal extends Goal {}

class SecondChargeClean extends pddlActionIntention {
    static parameters = ["r"];
    static precondition = [["inRoom", "r"], ["mediumCharge"]];
    static effect = [["cleaned", "r"], ["lowCharge"], ["not mediumCharge"]];

    static applicable (goal) {
        return goal instanceof SecondChargeCleanGoal;
    }

    *exec() {
        if (this.checkPrecondition()) {
            yield this.agent.device.cleanRoom();
            this.applyEffect();
        } else {
            throw new Error("Pddl precondition not valid");
        }
    }
}

class ChargeGoal extends Goal {}

class Charge extends pddlActionIntention {
    static parameters = ["r"];
    static precondition = [["inRoom", "r"], ["base", "r"], ["lowCharge"]];
    static effect = [["highCharge"], ["not lowCharge"], ["not mediumCharge"]];

    static applicable (goal) {
        return goal instanceof ChargeGoal;
    }

    *exec() {
        if (this.checkPrecondition()) {
            yield this.agent.device.chargeVacuumCleaner();
            this.applyEffect();
        } else {
            throw new Error("Pddl precondition not valid");
        }
    }
}

class SenseRetryGoal extends Goal {}

class SenseRetryFourTimesIntention extends Intention {
    static applicable (goal) {
        return goal instanceof SenseRetryGoal;
    }

    *exec({goal, hh, mm} = parameters) {
        while (true) {
            yield Clock.global.notifyAnyChange();
            if (Clock.global.hh == hh && Clock.global.mm == mm) {
                for (let i = 0; i < 4; i++) {
                    let goalAchieved = yield this.agent.postSubGoal(goal);
                    if (goalAchieved)
                        return true;
                    this.log('wait for something to change on beliefset before retrying for the ' + (i + 2) + 'th time goal', goal.toString());
                    yield this.agent.beliefs.notifyAnyChange();
                }
            }
        }
    }
}

module.exports = {
    SenseBatteryGoal, SenseBatteryIntention,
    SenseVacuumCleanerPositionGoal, SenseVacuumCleanerPositionIntention,
    SenseCleanRoomGoal, SenseCleanRoomIntention,
    Move, FirstChargeClean, SecondChargeClean, Charge,
    SenseRetryGoal, SenseRetryFourTimesIntention
};