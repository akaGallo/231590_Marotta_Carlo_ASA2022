const Observable =  require('./Observable')

class Clock {
    static global = new Observable({ dd: 0, hh: 0, mm: 0 });

    static format() {
        var time = Clock.global;
        return '' + time.dd + ':' + (time.hh < 10 ? '0' : '') + time.hh + ':' + (time.mm < 10 ? '0' : '') + time.mm;
    }

    static globalTimeInMinutes() {
        return Clock.global.dd * 60 * 24 + Clock.global.hh * 60 + Clock.global.mm;
    }

    static #start = true;

    static async stopTimer() {
        Clock.#start = false;
    }

    static async startTimer() {
        Clock.#start = true;
        while(Clock.#start) {
            await new Promise(res => setTimeout(res, 50));
            var { dd, hh, mm } = Clock.global;
            if (mm < 59)
                Clock.global.mm += 1; // Minutes increase one by one until the 59th minute
            else {
                if(hh < 23) {
                    Clock.global.hh += 1;
                    Clock.global.mm = 0; // However, observers are handled as microtask so at the time they are called everything will be sync
                } else {
                    Clock.global.mm = 0;
                    Clock.global.hh = 0;
                    Clock.global.dd += 1;
                }
            }
            // Time is logged immediately before any other observable gets updated
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(Clock.format() + '\t');
            //console.log(Clock.format());
        }
    }
}

module.exports = Clock;