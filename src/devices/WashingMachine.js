const Observable = require("../utils/Observable");

class WashingMachine extends Observable {
    constructor(house, name) {
        super();
        this.house = house; // Reference to the house
        this.name = name; // Non-observable
        this.set("cycleTime", 0); // Observable
        this.set("status", "off"); // Observable
    }

    setCycleTime(washCycle) {
        switch (washCycle) {
            case "COTTONS":
                this.cycleTime = 90; // 1 hour and a half
                break;
            case "SYNTHETICS":
                this.cycleTime = 60; // 1 hour
                break;
            case "DELICATES":
                this.cycleTime = 30; // Half an hour
                break;
            default:
                throw new Error("Failed, this washing machine cycle doesn't exist");
        }
    }

    turnOnWashingMachine(washCycle) {
        if (this.status === "on")
            return false;
        this.setCycleTime(washCycle); // The cycle time is set according to the wash cycle
        if (this.cycleTime > 0) {
            this.status = "on";
            this.house.utilities.electricity.consumption += 0.035 * this.cycleTime;
            console.log(this.name + " washing machine is turned on with cycle " + washCycle);
        }
        return true;
    }
    
    turnOffWashingMachine() {
        if (this.status === "off")
            return false;
        this.house.utilities.electricity.consumption -= 0.035 * this.cycleTime;
        this.status = "off";
        console.log(this.name + " washing machine is turned off");
        return true;
    }

    toJSON() {
        return this.name + " washing machine";
    }
}

module.exports = WashingMachine;