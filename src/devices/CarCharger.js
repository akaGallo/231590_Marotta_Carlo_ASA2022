const Observable = require('../utils/Observable');

class CarCharger extends Observable {
    constructor (house, type) {
        super();
        this.house = house; // Reference to the house
        this.type = type; // Non-observable
        this.name = "garage";
        this.batteryTocharge = 0;
        this.set("status", "off"); // Observable
        this.set("battery", 100); // Observable
    }

    startCharge(remainingBattery) {
        if (this.status === "on") 
            return false;
        this.battery = remainingBattery;
        console.log(this.type + " e-car starts charging");
        this.status = "on";
        this.batteryTocharge = (100 - this.battery)
        this.house.utilities.electricity.consumption += 5.76 * this.batteryTocharge;
        // The electric car has a capacity of 72kWh and a full car charge (100%) takes 8 hours (480 minutes).
    }

    stopCharge() {
        if (this.status === "off")
            return false;
        this.house.utilities.electricity.consumption -= 5.76 * this.batteryTocharge;
        this.batteryToCharge = 0;    
        this.status = "off";
        console.log(this.type + " e-car stops charging");
    }

    toJSON() {
        return this.name + this.type;
    }
}

module.exports = CarCharger;