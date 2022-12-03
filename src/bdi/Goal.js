const Observable = require("../utils/Observable")

var nextId = 0

class Goal extends Observable {
    constructor (parameters = {}) {
        super({ achieved: false });
        this.id = nextId++;
        this.parameters = parameters;
    }

    toJSON () {
        let j = {};
        j[this.constructor.name + '#' + this.id] = this.parameters;
        return j;
    }
      
    toString () {
        function replacer(key, mayBeGoal) {
            if (mayBeGoal instanceof Goal) { // Filtering out properties
                let j = {};
                j[mayBeGoal.constructor.name + '#' + mayBeGoal.id] = mayBeGoal.parameters;
                return j;
            }
            return mayBeGoal;
        }
        return JSON.stringify(this).replace(/\"([^(\")"]+)\":/g, "$1:");
    }
}

module.exports = Goal;