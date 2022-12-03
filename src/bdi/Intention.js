const Goal = require('./Goal');

var nextId = 0

class Intention {
    constructor (agent, goal) {
        this.id = nextId++;
        this.agent = agent;
        this.goal = goal;
    }

    log (...args) {
        let header = this.agent.name + '>' + this.constructor.name + '#' + this.id;
        this.agent.headerLog(header, ...args);
    }

    error (...args) {
        let header = this.agent.name + '>' + this.constructor.name + '#' + this.id;
        this.agent.headerError(header, ...args);
    }

    static applicable (goal) {
        if (goal instanceof Goal)
            return true;
        else
            return false;
    }

    async run () {
        this.log('Intention started');
        var iterator = this.exec(this.goal.parameters);
        var awaitedYield = null;
        var done = false;
        while (!done) {
            var yieldValue, { value: yieldValue, done } = iterator.next(awaitedYield);
            if (yieldValue instanceof Promise)
                yieldValue.catch(err => {});
            try {
                awaitedYield = await yieldValue; // Await for the eventual promise to resolve
            } catch (err) { // Errors catched here are already been catched and printed by .catch previously associated to the yieldValue promise
                this.error( 'Intention failed:', err.message || err || 'undefined error in yield statement' );
                throw err; // Since we are in an aync function, here we are rejecting the promise. We will need to catch this!
            }
            await new Promise(res => setTimeout(res, 0)); // Always wait for a timer to avoid stopping the event loop within microtask queue!
        }
        this.log('Intention success');
        return true;
    }
}

module.exports = Intention;