const fs = require('fs')
const padding = ' '.repeat(4)

class PddlDomain {
    constructor (name, predicates = [], actions = []) {
        this.name = name;
        this.predicates = predicates;
        this.actions = actions;
    }

    addPredicate (predicate) {
        if (this.predicates.find((e) => e[0] == predicate[0]))
            return false;
        this.predicates.push(predicate);
        predicate.toPddlString = function () { return '(' + predicate[0] + ' ' + predicate.slice(1).map(v => '?' + v).join(' ') + ')' };
        return predicate;
    }

    addAction (...actionClasses) {
        for (let actionClass of actionClasses) {
            let { parameters, precondition, effect } = actionClass;
            for (let p of precondition) {
                let not = p[0].split(' ')[0] == 'not';
                let predicate = (not ? p[0].split(' ')[1] : p[0]);
                let args = p.slice(1);
                this.addPredicate([predicate, ...args]);
            }
            for (let p of effect) {
                let not = p[0].split(' ')[0] == 'not';
                let predicate = (not ? p[0].split(' ')[1] : p[0]);
                let args = p.slice(1);
                this.addPredicate([predicate, ...args]);
            }
            this.actions.push(actionClass);
            actionClass.toPddlString = function () {
                return `
    (:action ${actionClass.name}
        :parameters (${parameters.map(p => '?'+p).join(' ')})
        :precondition (and
        ${PddlDomain.mapTokens(precondition)})
        :effect (and
        ${PddlDomain.mapTokens(effect)})
    )`
            }
        }
    }

    static mapTokens(tokens) {
        return tokens.map(p => {
            let not = p[0].split(' ')[0] == 'not';
            let predicate = (not ? p[0].split(' ')[1] : p[0]);
            let args = p.slice(1).map(v => '?' + v).join(' ');
            if (not)
                return `${padding}\t(not (${predicate} ${args}))`
            return `${padding}\t(${predicate} ${args})`
        }).join('\n' + padding.repeat(2));
    }

    saveToFile () {
        var path = 'src/houseworld/tmp/domain-' + this.name + '.pddl';
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
;; domain file: domain-${this.name}.pddl
(define (domain ${this.name})
    (:requirements :strips)
    (:predicates
        ${this.predicates.map( p => p.toPddlString()).join('\n' + padding.repeat(2))}              
    )
    ${this.actions.map( a => a.toPddlString()).join('\n' + padding.repeat(2))}
)`
    }
}

module.exports = PddlDomain;