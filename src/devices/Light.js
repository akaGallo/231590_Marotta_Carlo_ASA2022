const Observable = require('../utils/Observable');

class Light extends Observable {
    constructor (house, name) {
        super();
        this.house = house; // Reference to the house 
        this.name = name; // Non-observable
        this.set("status", "off"); // Observable
        this.set("intensity", 0); // Observable
    }

    switchOnLight() {
        if (this.status !== "off")
            return false;
        this.intensity = 60;
        this.status = "on";
        this.house.utilities.electricity.consumption += 0.001 * this.intensity;
        console.log(this.name + " light is switched on with " + this.intensity + "W");
    }

    switchOffLight() {
        if (this.status === "off")
            return false;
        this.house.utilities.electricity.consumption -= 0.001 * this.intensity;
        this.intensity = 0;
        this.status = "off";
        console.log(this.name + " light is switched off");
    }

    increaseIntensityManually(intensity) {
        if (this.intensity === 100 || this.status === "off")
            return false;
        if (this.intensity + intensity > 100)
            intensity = 100 - this.intensity; // Intensity is set to the maximum intensity that can be increased for a correct consumption
        this.house.utilities.electricity.consumption += 0.001 * intensity;
        this.intensity += intensity;
        this.status = "on manually";
        console.log(this.name + " light is increased manually reaching " + this.intensity + "W"); 
    }

    decreaseIntensityManually(intensity) {
        if (this.intensity + intensity <= 0) {
            this.house.utilities.electricity.consumption += 0.001 * this.intensity;
            this.intensity = 0;
            console.log(this.name + " light is switched off manually");
        } else {
            this.house.utilities.electricity.consumption += 0.001 * intensity; // The consumption is just for the intensity light reduced
            this.intensity += intensity; // Then, we update the intensity
            console.log(this.name + " light is decreased manually reaching " + this.intensity + "W");
        }
        this.status = "off manually";
    }

    toJSON() {
        return this.name + " light";
    }
}

module.exports = Light;