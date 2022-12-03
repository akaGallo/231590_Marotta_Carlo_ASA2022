const Clock =  require('../utils/Clock')
const { myDailyHouse } = require('../house/MyDailyHouse')

// Simulated daily schedule
Clock.global.observe('mm', (mm) => {
    var time = Clock.global;
    if (time.hh == 6 && mm == 35) myDailyHouse.devices.blinds.bedroomBlind.raiseBlind();
    if (time.hh == 6 && mm == 40) {
        myDailyHouse.people.carlo.moveTo("bathroom");
        myDailyHouse.devices.blinds.bathroomBlind.raiseBlind();
    }
    if (time.hh == 7 && mm == 00) {
        myDailyHouse.people.carlo.moveTo("kitchen");
        myDailyHouse.devices.blinds.kitchenBlind.raiseBlind();
    }
    if (time.hh == 7 && mm == 10) {
        myDailyHouse.people.carlo.moveTo("livingroom");
        myDailyHouse.devices.blinds.livingroomBlind.raiseBlind();
    }
    if (time.hh == 7 && mm == 20) myDailyHouse.people.carlo.moveTo("garage");
    if (time.hh == 8 && mm == 00) myDailyHouse.people.carlo.moveTo("livingroom");
    if (time.hh == 8 && mm == 25) myDailyHouse.people.carlo.moveTo("kitchen");
    if (time.hh == 8 && mm == 45) {
        myDailyHouse.people.carlo.moveTo("bathroom");
        myDailyHouse.devices.washingMachine.turnOnWashingMachine("COTTONS");
    }
    if (time.hh == 9 && mm == 00) myDailyHouse.people.carlo.moveTo("bedroom");
    if (time.hh == 9 && mm == 20) myDailyHouse.people.carlo.moveTo("livingroom");
    if (time.hh == 9 && mm == 25) myDailyHouse.people.carlo.moveTo("garage");
    if (time.hh == 9 && mm == 30) myDailyHouse.people.carlo.moveTo("outside");
    if (time.hh == 18 && mm == 30) {
        myDailyHouse.people.carlo.moveTo("garage");
        myDailyHouse.devices.carCharger.startCharge(50);
    }
    if (time.hh == 19 && mm == 40) myDailyHouse.people.carlo.moveTo("livingroom");
    if (time.hh == 19 && mm == 45) myDailyHouse.people.carlo.moveTo("bedroom");
    if (time.hh == 19 && mm == 50) myDailyHouse.people.carlo.moveTo("bathroom");
    if (time.hh == 20 && mm == 20) myDailyHouse.people.carlo.moveTo("bedroom");
    if (time.hh == 20 && mm == 30) myDailyHouse.people.carlo.moveTo("livingroom");
    if (time.hh == 20 && mm == 35) myDailyHouse.people.carlo.moveTo("kitchen");
    if (time.hh == 21 && mm == 30) myDailyHouse.people.carlo.moveTo("livingroom");
    if (time.hh == 22 && mm == 45) {
        myDailyHouse.devices.blinds.livingroomBlind.lowerBlind();
        myDailyHouse.people.carlo.moveTo("kitchen");
    }
    if (time.hh == 22 && mm == 50) {
        myDailyHouse.devices.blinds.kitchenBlind.lowerBlind();
        myDailyHouse.people.carlo.moveTo("bathroom");
    }
    if (time.hh == 22 && mm == 55) {
        myDailyHouse.devices.blinds.bathroomBlind.lowerBlind();
        myDailyHouse.people.carlo.moveTo("bedroom");
    }
    if (time.hh == 23 && mm == 00) myDailyHouse.devices.blinds.bedroomBlind.lowerBlind();
})

// The day is over
Clock.global.observe("dd", (dd) => {
    if (dd === 1) {
        process.exit();
    }
});

// Start clock
Clock.startTimer();