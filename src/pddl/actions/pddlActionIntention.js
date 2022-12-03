const Intention =  require('../../bdi/Intention')

class pddlActionIntention extends Intention {

    toString() {
        return '(' + this.constructor.name + ' ' + Object.values(this.goal.parameters).join(' ') + ')' + ' Effect: ' + this.effect;
    }

    get precondition () {
        return pddlActionIntention.ground(this.constructor.precondition, this.goal.parameters);
    }

    checkPrecondition () {
        return this.agent.beliefs.check(...this.precondition);
    }

    get effect () {
        return pddlActionIntention.ground(this.constructor.effect, this.goal.parameters);
    }

    checkEffect () {
        return this.agent.beliefs.check(...this.effect);
    }

    applyEffect () {
        for (let b of this.effect)
            this.agent.beliefs.apply(b);
    }

    static ground (parametrizedLiterals, parametersMap) {
        return parametrizedLiterals.map((literal) => {
            let possibly_negated_predicate = literal[0];
            let vars = literal.slice(1);
            let grounded = possibly_negated_predicate;
            for (let v of vars)
                grounded = grounded + ' ' + parametersMap[v];
            return grounded;
        })
    }
}

module.exports = pddlActionIntention;