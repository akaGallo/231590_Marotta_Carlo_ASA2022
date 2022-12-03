const fs = require('fs')

class PddlProblem {
    constructor(name, objects = [], inits = [], goals = []) {
        this.name = name;
        this.objects = objects;
        this.objects.toPddlString = () => { return this.objects.join(' ') };
        this.inits = inits;
        this.inits.toPddlString = () => { return this.inits.map(e => '\n\t\t(' + e + ')').join(' ') };
        this.goals = goals;
        this.goals.toPddlString = () => { return '\n\t\t(and ' + this.goals.map(e => '\n\t\t(' + e + ')').join(' ') + '\n\t\t)' };
    }

    addObject ( ...object ) {
        this.objects.push(...object);
    }

    addInit (...init) {
        this.inits.push(...init);
    }

    addGoal (...goal) {
        this.goals.push(...goal);
    }

    saveToFile () {
        var path = 'src/houseworld/tmp/problem-' + this.name + '.pddl';
        return new Promise( (res, rej) => {
            fs.writeFile(path, this.content, err => {
                if (err)
                    rej(err);
                else
                    res(path);
            })
        })
    }

    get content() {
        return `\
;; problem file: problem-${this.name}.pddl
(define (problem ${this.name})
    (:domain ${this.name})
    (:objects ${this.objects.toPddlString()})
	(:init ${this.inits.toPddlString()}
    )
	(:goal ${this.goals.toPddlString()}
    )
)
`
    }
}

module.exports = PddlProblem;