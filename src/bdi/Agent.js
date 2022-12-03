const Beliefset =  require('./Beliefset')
const chalk = require('chalk');

var nextId = 0
const colors = ['red', 'blue', 'green', 'yellow', 'magenta', 'cyan', 'redBright', 'greenBright', 'yellowBright', 'blueBright', 'magentaBright', 'cyanBright', 'whiteBright']

class Agent {
    constructor (name) {
        this.name = name;
        this.id = nextId++;
        this.beliefs = new Beliefset();
        this.beliefs.observeAny((v, fact) => this.log('Belief changed: ' + (v ? fact : 'not ' + fact)));
        this.intentions = [];
    }

    headerError (header = '', ...args) {
        header += ' '.repeat(Math.max(30 - header.length, 0));
        console.error(chalk.bold.italic[colors[this.id % colors.length]](header, ...args));
    }

    error (...args) {
        this.headerError(this.name, ...args);
    }

    headerLog (header = '', ...args) {
        header += ' '.repeat(Math.max(30 - header.length, 0));
        console.log(chalk[colors[this.id % colors.length]](header, ...args));
    }

    log (...args) {
        this.headerLog(this.name, ...args);
    }

    async postSubGoal (subGoal) {
        for (let intentionClass of Object.values(this.intentions)) { 
            if (!intentionClass.applicable(subGoal)) // By default applicable(goal) returns true (see class Intention)
                continue; // If not applicable try next
            this.log('Trying to use intention', intentionClass.name, 'to achieve goal', subGoal.toString());
            var intention = new intentionClass(this, subGoal);
            var success = await intention.run().catch( err => {
                this.error('Failed to use intention', intentionClass.name, 'to achieve goal', subGoal.toString() + ':', err.message || err || 'undefined error');
                this.error( err.stack || err || 'undefined error');
            })
            if (success) {
                this.log('Succesfully used intention', intentionClass.name, 'to achieve goal', subGoal.toString());
                subGoal.achieved = true;
                return Promise.resolve(true); // Same as: return true;
            } else {
                continue; // Retrying
            }
        }
        this.log('No success in achieving goal', subGoal.toString());
        return Promise.resolve(false); // Different from: return false; which would reject the promise
    }
}

module.exports = Agent;