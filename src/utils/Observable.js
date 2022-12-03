class Observable {
    #values;
    #observers;

    constructor (init = {}) {
        this.#values = {};
        this.#observers = {};
        this.genericObservers = [];
        for (let [key,value] of Object.entries(init)) {
            this.set (key, value);
        }
    }
    
    defineProperty (key) {
        if (!(key in this.#observers)) {
            this.#observers[key] = {};
        }
        if (!(this.hasOwnProperty(key))) {
            this[key] = {};
            Object.defineProperty (this, key, {
                get: () => this.#values[key],
                set: (v) => {
                    this.#values[key] = v;
                    Promise.resolve().then( () => {
                        for (let obs of this.genericObservers)
                            obs(v, key, this);
                        for (let obs of Object.values(this.#observers[key]))
                            obs(v, key, this);
                    }).catch( err => console.error(err) )
                }
            })
        }
    }

    set (key, value) {
        this.defineProperty(key);
        if (this[key] != value) {
            this[key] = value; // Use earlier defined setter and call observers
            return true;
        } else
            return false;
    }

    get entries () {
        return Object.entries(this.#values);
    }

    observeAny (observer) {
        this.genericObservers.push(observer);
    }

    observe (key, observer, observerKey = null) {
        this.defineProperty(key);
        if (observerKey == null) {
            this.#observers[key][observer] = observer;
        } else {
            this.#observers[key][observerKey] = observer;
        }
    }

    unobserve (key, observer, observerKey = null) {
        if (key in this.#observers){
            if (observerKey == null) {
                delete this.#observers[key][observer];
            } else {
                delete this.#observers[key][observerKey];
            }
        }
    }

    async notifyChange (key, observerKey = null) {
        return new Promise( res => { // Promise that resolves when observed value changes
            var tmpObs = (value, key, observer) => {
                this.unobserve(key, tmpObs, observerKey);
                res(value);
            }
            this.observe(key, tmpObs, observerKey);
        })
    }

    async notifyAnyChange () {
        return new Promise( res => { // Promise that resolves when any among the observed values changes
            var tmpObs = (value, key, observer) => {
                res(value);
            }
            this.observeAny(tmpObs);
        })
    }
}

module.exports = Observable;