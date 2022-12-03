const Goal =  require('../../bdi/Goal')

class pddlActionGoal extends Goal {

    toString() {
        return this.constructor.name + '#' + this.id + ' args:' + this.parameters.args;
    }
}

module.exports = pddlActionGoal;