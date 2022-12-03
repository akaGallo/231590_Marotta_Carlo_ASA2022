const Intention = require('../bdi/Intention')
const PddlDomain = require('./PddlDomain')
const PddlProblem = require('./PddlProblem')
const pddlActionGoal =  require('./actions/pddlActionGoal')
const PlanningGoal =  require('./PlanningGoal')
const fetch = require('node-fetch') // Import fetch from 'node-fetch'

function setup (intentions = []) {

    var OnlinePlanning = class extends Intention {

        constructor (agent, goal) {
            super(agent, goal);
            this.plan = [];
        }

        static actions = {};

        static addAction (intentionClass) {
            this.actions[intentionClass.name.toLowerCase()] = intentionClass;
        }

        static getAction (name) {
            return this.actions[name];
        }

        static applicable (goal) {
            return goal instanceof PlanningGoal;
        }

        async doPlan (domainFile, problemFile) {
            var res = await fetch("http://solver.planning.domains/solve", {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({domain: domainFile.content, problem: problemFile.content})
            }).then(function (res) {
                return res.json();
            }).then(function (res) {
                return res;
            })
            if (!res.result.plan && res.result.output.split('\n')[0] != ' --- OK.') {
                this.log('No plan found');
                this.log(res);
                throw new Error('Plan not found');
            }
            this.log('Plan found:');
            var planStruct = [];
            if (res.result.plan) {
                for (let step of res.result.plan) {
                    let s = step.name.replace('(', '').replace(')', '').split(' ');
                    this.log('- ' + step.name);
                    planStruct.push(s);
                }
            }
            for (let line of planStruct) {
                var action = line.shift();
                var args = line;
                var intentionClass = this.constructor.getAction(action);
                var mappedArgs = {};
                for (let index = 0; index < intentionClass.parameters.length; index++) {
                    let k = intentionClass.parameters[index];
                    let v = args[index];
                    mappedArgs[k] = v;
                }
                var intentionInstance = new intentionClass(this.agent, new pddlActionGoal(mappedArgs));
                this.plan.push({parallel: false, intention: intentionInstance});
            }
            return;
        }

        *exec () {
            var pddlDomain = new PddlDomain(this.agent.name);
            pddlDomain.addAction(...Object.values(this.constructor.actions));
            var domainFile = yield pddlDomain.saveToFile();
            var pddlProblem = new PddlProblem(this.agent.name);
            pddlProblem.addObject(...this.agent.beliefs.objects);
            pddlProblem.addInit(...this.agent.beliefs.entries.filter(([fact, value]) => value).map(([fact, value]) => fact));
            pddlProblem.addGoal(...this.goal.parameters.goal);
            var problemFile = yield pddlProblem.saveToFile();
            yield this.doPlan(pddlDomain, pddlProblem);
            var previousStepGoals = [];
            for (const step of this.plan) {
                if (step.parallel) {
                    this.log('Starting concurrent step ' + step.intention.toString());
                } else {
                    yield Promise.all(previousStepGoals);
                    previousStepGoals = [];
                    this.log('Starting sequential step ' + step.intention.toString());
                }
                previousStepGoals.push(step.intention.run().catch(err => {
                    throw err;
                }));
            }
            yield Promise.all(previousStepGoals); // Wait for last steps to complete before finish blackbox plan execution intention
        }
    } // End of class Blackbox extends Intention
    for (let intentionClass of intentions) {
        OnlinePlanning.addAction(intentionClass);
    }
    return {OnlinePlanning};
}

module.exports = setup;