const Clock = require('../utils/Clock')
const Goal = require('../bdi/Goal')
const Intention = require('../bdi/Intention')

class AlarmGoal extends Goal {}

class AlarmIntention extends Intention {
    static applicable(goal) {
        return goal instanceof AlarmGoal;
    }
    
    *exec({hh, mm} = parameters) {
        while (true) {
            Clock.global.notifyChange('mm');
            yield;
            if (Clock.global.hh == hh && Clock.global.mm == mm) {
                this.log('ALARM, WAKE UP! It\'s ' + (hh < 10 ? '0' : '') + hh + ":" + (mm < 10 ? '0' : '') + mm + "!");
                break;
            }
        }
    }
}

module.exports = {
    AlarmGoal, AlarmIntention
};