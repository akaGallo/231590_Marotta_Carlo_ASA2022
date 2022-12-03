const Clock =  require('../utils/Clock')
const { mySundayHouse } = require('../house/MySundayHouse')

// Simulated Sunday schedule
Clock.global.observe('mm', (mm) => {
    var time = Clock.global;
    if (time.hh == 1 && mm == 30) {
        mySundayHouse.people.carlo.moveTo("garage");
        mySundayHouse.devices.carCharger.startCharge(10);
    }
    if (time.hh == 1 && mm == 35) mySundayHouse.people.carlo.moveTo("livingroom");
    if (time.hh == 1 && mm == 40) mySundayHouse.people.carlo.moveTo("bedroom");
    if (time.hh == 1 && mm == 45) mySundayHouse.people.carlo.moveTo("bathroom");
    if (time.hh == 1 && mm == 55) mySundayHouse.people.carlo.moveTo("bedroom");
    if (time.hh == 10 && mm == 35) {
        mySundayHouse.devices.blinds.bedroomBlind.raiseBlind();
        mySundayHouse.people.carlo.moveTo("bathroom");
    }
    if (time.hh == 10 && mm == 40) mySundayHouse.devices.blinds.bathroomBlind.raiseBlind();
    if (time.hh == 10 && mm == 55) mySundayHouse.people.carlo.moveTo("kitchen");
    if (time.hh == 10 && mm == 56) mySundayHouse.devices.blinds.kitchenBlind.raiseBlind();
    if (time.hh == 11 && mm == 15) mySundayHouse.people.carlo.moveTo("livingroom");
    if (time.hh == 11 && mm == 16) mySundayHouse.devices.blinds.livingroomBlind.raiseBlind();
    if (time.hh == 11 && mm == 45) mySundayHouse.people.carlo.moveTo("outside");
    if (time.hh == 11 && mm == 50) mySundayHouse.people.carlo.moveTo("garage");
    if (time.hh == 12 && mm == 50) mySundayHouse.people.carlo.moveTo("livingroom");
    if (time.hh == 12 && mm == 55) mySundayHouse.people.carlo.moveTo("bedroom");
    if (time.hh == 13 && mm == 00) {
        mySundayHouse.people.carlo.moveTo("bathroom");
        mySundayHouse.devices.washingMachine.turnOnWashingMachine("SYNTHETICS");
    }
    if (time.hh == 13 && mm == 30) mySundayHouse.people.carlo.moveTo("bedroom");
    if (time.hh == 13 && mm == 45) mySundayHouse.people.carlo.moveTo("livingroom");
    if (time.hh == 14 && mm == 00) mySundayHouse.people.carlo.moveTo("kitchen");
    if (time.hh == 15 && mm == 00) mySundayHouse.people.carlo.moveTo("bathroom");
    if (time.hh == 15 && mm == 15) mySundayHouse.people.carlo.moveTo("bedroom");
    if (time.hh == 15 && mm == 20) mySundayHouse.people.carlo.moveTo("livingroom");
    if (time.hh == 15 && mm == 30) mySundayHouse.people.carlo.moveTo("outside");
    if (time.hh == 22 && mm == 00) mySundayHouse.people.carlo.moveTo("livingroom");
    if (time.hh == 22 && mm == 05) mySundayHouse.people.carlo.moveTo("bedroom");
    if (time.hh == 22 && mm == 10) mySundayHouse.people.carlo.moveTo("bathroom");
    if (time.hh == 22 && mm == 20) {
        mySundayHouse.devices.blinds.bathroomBlind.lowerBlind();
        mySundayHouse.people.carlo.moveTo("kitchen");
    }
    if (time.hh == 22 && mm == 25) {
        mySundayHouse.devices.blinds.kitchenBlind.lowerBlind();
        mySundayHouse.people.carlo.moveTo("livingroom");
    }
    if (time.hh == 22 && mm == 40) {
        mySundayHouse.devices.blinds.livingroomBlind.lowerBlind();
        mySundayHouse.people.carlo.moveTo("bedroom");
    }
    if (time.hh == 22 && mm == 45) mySundayHouse.devices.blinds.bedroomBlind.lowerBlind();
})

Clock.global.observe("dd", (dd) => {
    if (dd === 1) { // It's Monday
        process.exit();
    }
});
    
// Start clock
Clock.startTimer();