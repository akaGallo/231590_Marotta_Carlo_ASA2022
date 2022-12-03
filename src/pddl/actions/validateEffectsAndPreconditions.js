const Intention =  require('../../bdi/Intention')
const BeliefSet =  require('../../bdi/Beliefset')

class PddlIntention extends Intention {
    constructor (agent, goal) {
        super(agent, goal);
        this.parameters = this.constructor.validateParameters(goal, this.agent);
    }

    validateParameters (goal, agent) {
        goal = goal.map(e => e.split(' '));
        function valid_params_for_preconditions(preconditions, incoming_params = {}) { // Given precondition
            var precond = preconditions[0];
            if (precond == undefined)
                return true;
            for (let literal in this.agent.beliefSet.literals) { // For all current beliefset
                var current_params = {};
                Object.assign(current_params, incoming_params);
                if (literal.length != precond.length ||
                    literal[0] != precond[0] ||
                    (literal[0] == 'not' && (literal[1] != precond[1]))) // Belief NOT compatible, != number of parameters or != predicate
                    continue; // Try with remaining effects
                var params_n = (literal[0] == 'not' ? literal.length - 2 : literal.length - 1);
                for (let i = params_n; i > 0; i--) { // For each parameter
                    let key = literal[i];
                    let value = precond[i];
                    if (!(key in current_params)) // Save desired value of each parameter
                        current_params[key] = value;
                    if (current_params[key]!=value) // If parameter DOES NOT match
                        break; // Parameter has already been assigned to a different value
                }
                if (i > 0) // Conflict with already defined parameters has been found and loop broke earlier
                    continue; // Try with remaining effects
                var complete_params = valid_params_for_preconditions(preconditions.slice(1), current_params); // Recursion
                if (complete_params)
                    return current_params;
            }
            return false; // No valid parameter found for this effect to be applicable to this goal
        }

        function valid_params_for_effects(goals, incoming_params = {}) { // Given goal
            var g = goals[0];
            if (g == undefined)
                return true;
            for (let e in this.constructor.effect) { // For all possible effects
                var current_params = {};
                Object.assign(current_params, incoming_params);
                if (e.length != g.length || e[0] != g[0]) // Effect NOT compatible, != number of parameters or != predicate
                    continue; // Try with remaining effects
                for (let i = e.length - 1; i > 0; i--) { // For each parameter
                    let key = e[i];
                    let value = g[i];
                    if (!(key in current_params)) // Save desired value of each parameter
                        current_params[key] = value;
                    if (current_params[key]!=value) // If parameter DOES NOT match
                        break; // Parameter has already been assigned to a different value
                }
                if (i > 0) // Conflict with already defined parameters has been found and loop broke earlier
                    continue; // Try with remaining effects
                var complete_params = valid_params_for_effects(goals.slice(1), current_params); // Recursion
                complete_params = valid_params_for_preconditions(this.constructor.precondition, current_params); // Check if up to now precondition can also be satisfied
                if (complete_params)
                    return current_params;
            }
            return false; // No valid parameter found for this effect to be applicable to this goal
        }
        return valid_params_for_effects(goal, {}); // Return valid parameters to fulfill this goal with the effects of this intention or return false
    }

    get precondition () {
        return BeliefSet.ground(this.constructor.precondition, this.parameters);
    }

    checkPrecondition (beliefSet) {
        return beliefSet.check(this.precondition);
    }

    get effect () {
        return BeliefSet.ground(this.constructor.effect, this.parameters);
    }

    checkEffect (beliefSet) {
        return beliefSet.check(this.effect);
    }

    applyEffect (beliefSet) {
        for (let b of this.effect)
            beliefSet.apply(b);
    }
}

module.exports = PddlIntention;