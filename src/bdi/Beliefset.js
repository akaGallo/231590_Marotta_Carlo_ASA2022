const Observable =  require('../utils/Observable')

class Beliefset extends Observable { // Implementation based on Observable
    #objectsMap;
    
    constructor () {
        super({});
        this.#objectsMap = {};
    }

    addObject (obj) {
        if (!(typeof obj === 'string'))
            throw ('String expected, got ' + typeof obj + ': ' + obj);
        this.#objectsMap[obj] = obj;
    }

    removeObject (obj) {
        if (!(typeof obj === 'string'))
            throw ('String expected, got ' + typeof obj + ': ' + obj);
        delete this.#objectsMap[obj];
    }

    get objects () {
        return Object.values(this.#objectsMap);
    }

    undeclare (fact) {
        return this.declare(fact, false);
    }

    declare (fact, value = true) {
        if (!(typeof fact === 'string'))
            throw ('String expected, got ' + typeof fact + ': ' + fact);
        if (fact.split(' ')[0] == 'not')
            throw ('Fact expected, got a negative literal: ' + fact);
        var changed = this.set(fact, value);
        if (changed)
            for (let obj of fact.split(' ').splice(1))
                this.addObject(obj);
        return changed;
    }

    get literals () {
        return this.entries.map(([fact, value]) => (value ? fact : 'not (' + fact + ')'));
    }

    apply (...literals) {
        for (let literal of literals) {
            var not = literal.split(' ')[0] == 'not';
            var fact = (not ? literal.split(' ').splice(1).join(' ') : literal);
            this.declare(fact, !not);
        }
    }

    check (...literals) {
        for (let literal of literals) {
            let not = literal.split(' ')[0] == 'not';
            let fact = (not ? literal.split(' ').splice(1).join(' ') : literal);
            if (this[fact])
                if (not)
                    return false;
                else
                    continue;
            else // Closed World assumption; if i don't know about something then it is false
                if (not)
                    continue;
                else
                    return false;
        }
        return true;
    }
}

module.exports = Beliefset;