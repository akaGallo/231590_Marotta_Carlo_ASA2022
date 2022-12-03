const Observable = require('../utils/Observable');

class Blind extends Observable {
    constructor (house, name) {
        super();
        this.house = house; // Reference to the house
        this.name = name; // Non-observable
        this.set("status", "close"); // Observable
        this.set("spanTime", 0); // Observable
    }

    raiseBlind() {
        if (this.status === "open")
            return false;
        this.status = "open";
        this.spanTime = 5; // Opening time
        this.house.utilities.electricity.consumption += 0.29 * (this.spanTime / 60); 
        console.log(this.name + " blind is open");
        return true;
    }

    lowerBlind() {
        if (this.status === "close")
            return false;
        console.log(this.name + " blind is close");
        this.status = "close";
        this.spanTime = 5; // Closing time
        this.house.utilities.electricity.consumption -= 0.029 * (this.spanTime / 60);
        return true;
    }

    toJSON() {
        return this.name + " blind";
    }
}

module.exports = Blind;