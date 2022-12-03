const Observable = require("../utils/Observable");
const Clock = require("../utils/Clock");

class VacuumCleaner extends Observable {
    constructor(house, name) {
        super();
        this.house = house; // Reference to the house
        this.name = name; // Non-observable
        this.base = "livingroom";
        this.set("status", "off"); // Observable
        this.set("inRoom", "livingroom"); // Observable
        this.set("battery", 100); // Observable
    }

    async moveToRoom(room) {
        if (this.house.rooms[this.inRoom].doorTo.includes(room)) {
            let changingRoomTime = 5;
            let startingTime = Clock.globalTimeInMinutes();
            while (true) {
                await Clock.global.notifyAnyChange();
                if (Clock.globalTimeInMinutes() - startingTime >= changingRoomTime) // 5 minutes for changing room
                    break;
            }
            console.log("Vacuum cleaner " + this.name + " move from " + this.inRoom + " to " + room + "!");
            this.inRoom = room;
            return true;
        } else {
            throw new Error ("Failed moving from " + this.inRoom + " to " + room);
        }
    }
    
    async cleanRoom() {
        this.status = "on";
        let cleaningTime = 20;
        let startingTime = Clock.globalTimeInMinutes();
        while(true) {
            await Clock.global.notifyAnyChange();
            if (Clock.globalTimeInMinutes() - startingTime >= cleaningTime) // 20 minutes for cleaning room
                break;
        }
        console.log(this.inRoom + " is cleaned by vacuum cleaner " + this.name + "!");
        this.status = "off";
        this.battery -= 40;
        return true;
    }

    async chargeVacuumCleaner() {
        if (this.inRoom !== this.base)
            return false;
        let chargingTime = 3 * (100 - this.battery);
        // A full vacuum cleaner charge takes 5 hours (300 minutes).
        // The charging time is given by the following proportion -> 100 : 300 = batteryToCharge : chargingTime
        let startingTime = Clock.globalTimeInMinutes();
        this.house.utilities.electricity.consumption += 0.037 * chargingTime;
        console.log("Vacuum cleaner " + this.name + " is charging!");
        while (true) {
            await Clock.global.notifyAnyChange();
            if (Clock.globalTimeInMinutes() - startingTime >= chargingTime)
                break;
        }
        this.house.utilities.electricity.consumption -= 0.037 * chargingTime;
        console.log("Vacuum cleaner " + this.name + " has full battery!");
        this.battery = 100;
        return true;
    }

    toJSON() {
        return this.name;
    }
}

module.exports = VacuumCleaner;