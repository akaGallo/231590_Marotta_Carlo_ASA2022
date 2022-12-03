const Observable = require("../utils/Observable");

class FloorHeater extends Observable {
    constructor(house, name, temperature) {
        super();
        this.house = house; // Reference to the house
        this.name = name; // Non-observable
        this.set("status", "off"); // Observable
        this.set("temperature", temperature) // Observable
    }

    startFloorHeater() {
        if (this.status === "on")
            return false;
        this.status = "on";
        this.house.utilities.electricity.consumption += 0.17;
        console.log(this.name + " floor heater is on");
        return true;
    }

    stopFloorHeater() {
        if (this.status === "off")
            return false;
        this.status = "off";
        this.house.utilities.electricity.consumption -= 0.17;
        console.log(this.name + " floor heater is off");
        return true;
    }

    increaseValue(amount) {
        this.temperature = (parseFloat(this.temperature) + amount).toFixed(1); // Temperature is rounded to 1 decimal place
    }

    toJSON() {
        return this.name + " floor heater";
    }
}

module.exports = FloorHeater;