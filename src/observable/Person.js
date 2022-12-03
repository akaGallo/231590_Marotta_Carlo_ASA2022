const Observable = require('../utils/Observable');

class Person extends Observable {
    constructor (house, name, room) {
        super();
        this.house = house; // Reference to the house
        this.name = name;  // Non-observable
        this.set('inRoom', room); // Observable
    }

    moveTo(to) {
        if ((this.inRoom === "livingroom" || this.inRoom === "garage") && to === "outside") { // People can only exit through the main livingroom door or the garage
            console.log(this.name + ' moved ' + to);
            this.inRoom = to;
            return true;
        } else if (this.inRoom === "outside") {
            if (to === "garage" || to === "livingroom") { // People can only enter through the main livingroom door or the garage
                console.log(this.name + ' moved from ' + this.inRoom + ' to ' + to);
                this.inRoom = to;
                return true;
            } else {
                throw new Error("Failed, " + this.name + " can't make this move");
            }
        } else if (this.house.rooms[this.inRoom].doorTo.includes(to)) { // If exists a door between this.inRoom and to(room)
            console.log(this.name + ' moved from ' + this.inRoom + ' to ' + to);
            this.inRoom = to;
            return true;
        } else if (this.inRoom === to) { // If people are already in this.inRoom
            console.log(this.name + ' is already in ' + to);
        } else {
            throw new Error("Failed, " + this.name + " can't make this move");
        }
    }

    toJSON() {
        return this.name;
    }
}

module.exports = Person;