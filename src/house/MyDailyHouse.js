// bdi
const Agent = require('../bdi/Agent')

// utils
const Observable =  require('../utils/Observable')

// pddl
const PlanningGoal = require('../pddl/PlanningGoal')

// devices
const Blind = require('../devices/Blind')
const CarCharger = require('../devices/CarCharger')
const FloorHeater = require('../devices/FloorHeater')
const Light = require('../devices/Light')
const VacuumCleaner = require('../devices/VacuumCleaner')
const WashingMachine = require('../devices/WashingMachine')

// houseworld
    // Alarm intentions
const { AlarmGoal, AlarmIntention } = require('../houseworld/AlarmSensor')

    // Blinds intentions
const { SenseBlindsGoal, SenseBlindsIntention,
    SenseRaiseBlindsGoal, SenseRaiseBlindsIntention,
    SenseLowerBlindsGoal, SenseLowerBlindsIntention } = require('../houseworld/BlindsSensor')

    // CarCharger intentions
const { SenseCarChargerGoal, SenseCarChargerIntention,
    SenseStartCarChargingGoal, SenseStartCarChargingIntention,
    SenseFullBatteryChargingGoal, SenseFullBatteryChargingIntention,
    SenseStopCarChargingGoal, SenseStopCarChargingIntention } = require('../houseworld/CarChargerSensor')

    // FloorHeater intentions
const { SenseFloorHeatersGoal, SenseFloorHeatersIntention,
    SenseTemperatureGoal, SenseTemperatureIntention,
    SenseHeatOccupiedRoomGoal, SenseHeatOccupiedRoomIntention,
    SenseMediumTemperatureUnoccupiedRoomGoal, SenseMediumTemperatureUnoccupiedRoomIntention,
    SenseLowTemperatureUnoccupiedRoomGoal, SenseLowTemperatureUnoccupiedRoomIntention } = require("../houseworld/FloorHeatersSensor")

    // Light intentions
const { SenseLightsGoal, SenseLightsIntention,
    SenseIntensityGoal, SenseIntensityIntention,
    SenseAutoLightRoomOccupancyGoal, SenseAutoLightRoomOccupancyIntention,
    SenseAutoTurnOnLightIntention,
    SenseAutoTurnOffLightIntention,
    SenseSetIntensityManuallyGoal, SenseSetIntensityManuallyIntention } = require('../houseworld/LightsSensor')

    // RoomOccupancy intentions
const { SenseRoomOccupancyIntention, SenseRoomOccupancyGoal } = require("../houseworld/RoomOccupancySensor")

    // VacuumCleaner intentions
const { SenseBatteryGoal, SenseBatteryIntention,
    SenseVacuumCleanerPositionGoal, SenseVacuumCleanerPositionIntention,
    SenseCleanRoomGoal, SenseCleanRoomIntention,
    Move, FirstChargeClean, SecondChargeClean, Charge,
    SenseRetryGoal, SenseRetryFourTimesIntention } = require("../houseworld/VacuumCleanerSensor")

    // WashingMachine intentions
const { SenseWashingMachineGoal, SenseWashingMachineIntention,
    SenseTurnOnWashingMachineGoal, SenseTurnOnWashingMachineIntention,
    SenseRunningWashingMachineGoal, SenseRunningWashingMachineIntention,
    SenseTurnOffWashingMachineGoal, SenseTurnOffWashingMachineIntention } = require('../houseworld/WashingMachineSensor')

// observable
const Person = require('../observable/person')

// My Daily House
class DailyHouse {
    constructor () {
        this.people = { carlo: new Person(this, 'Carlo', 'bedroom') };

        this.rooms = {
            livingroom: { name: "livingroom", doorTo: ["kitchen", "bedroom", "garage"], cleaned: false },
            kitchen: { name: "kitchen", doorTo: ["livingroom", "bathroom"], cleaned: false },
            bedroom: { name: "bedroom", doorTo: ["livingroom", "bathroom"], cleaned: false },
            bathroom: { name: "bathroom", doorTo: ["kitchen", "bedroom"], cleaned: false },
            garage: { name: "garage", doorTo: ["livingroom"] }
        };

        this.devices = {
            blinds: {
                livingroomBlind: new Blind(this, "livingroom"),
                kitchenBlind: new Blind(this, "kitchen"),
                bedroomBlind: new Blind(this, "bedroom"),
                bathroomBlind: new Blind(this, "bathroom")
            },
            carCharger: new CarCharger(this, "Hyundai"),
            heater: {
                livingroomHeater: new FloorHeater(this, "livingroom", 18),
                kitchenHeater: new FloorHeater(this, "kitchen", 18),
                bedroomHeater: new FloorHeater(this, "bedroom", 22),
                bathroomHeater: new FloorHeater(this, "bathroom", 18)
            },
            lights: {
                livingroomLight: new Light(this, "livingroom"),
                kitchenLight: new Light(this, "kitchen"),
                bedroomLight: new Light(this, "bedroom"),
                bathroomLight: new Light(this, "bathroom"),
                garageLight: new Light(this, "garage")
            },
            vacuumCleaner: new VacuumCleaner(this, "DYSON"),
            washingMachine: new WashingMachine(this, "bathroom")
        };

        this.utilities = {
            electricity: new Observable({ consumption: 0 }),
        };
    }
}

var sensor = (agent) => (value, key, observable) => { value ? agent.beliefs.declare(key) : agent.beliefs.undeclare(key) };

// House and Agents
var myDailyHouse = new DailyHouse();
var roomAgent = new Agent("RoomAgent");             // (RED) Agent for room occupancy
var houseAgent = new Agent("HouseAgent");           // (BLUE) Agent for Alarm, WashingMachine, CarCharger and Blinds
var heaterAgent = new Agent("HeaterAgent");         // (GREEN) Agent for FloorHeaters
var lightAgent = new Agent("LightAgent");           // (YELLOW) Agent for Lights
var vacuumAgent = new Agent("VacuumCleanerAgent");  // (MAGENTA) Agent for VacuumCleaner
roomAgent.beliefs.observeAny(sensor(heaterAgent));
roomAgent.beliefs.observeAny(sensor(lightAgent));

// Goals and intentions

// Room occupancy
roomAgent.intentions.push(SenseRoomOccupancyIntention);
roomAgent.postSubGoal(new SenseRoomOccupancyGoal({ people: Object.values(myDailyHouse.people) }));

// Alarm
houseAgent.intentions.push(AlarmIntention);
houseAgent.postSubGoal(new AlarmGoal({ hh: 6, mm: 30 }));

// Washing machine
houseAgent.intentions.push(SenseWashingMachineIntention);
houseAgent.postSubGoal(new SenseWashingMachineGoal({ washingMachine: myDailyHouse.devices.washingMachine }));
houseAgent.intentions.push(SenseTurnOnWashingMachineIntention);
houseAgent.postSubGoal(new SenseTurnOnWashingMachineGoal({ washingMachine: myDailyHouse.devices.washingMachine }));
houseAgent.intentions.push(SenseRunningWashingMachineIntention);
houseAgent.postSubGoal(new SenseRunningWashingMachineGoal({ washingMachine: myDailyHouse.devices.washingMachine }));
houseAgent.intentions.push(SenseTurnOffWashingMachineIntention);
houseAgent.postSubGoal(new SenseTurnOffWashingMachineGoal({ washingMachine: myDailyHouse.devices.washingMachine }));

// Blinds
houseAgent.intentions.push(SenseBlindsIntention);
houseAgent.postSubGoal(new SenseBlindsGoal({ blinds: Object.values(myDailyHouse.devices.blinds) }));
houseAgent.intentions.push(SenseRaiseBlindsIntention);
houseAgent.postSubGoal(new SenseRaiseBlindsGoal({ blinds: Object.values(myDailyHouse.devices.blinds) }));
houseAgent.intentions.push(SenseLowerBlindsIntention);
houseAgent.postSubGoal(new SenseLowerBlindsGoal({ blinds: Object.values(myDailyHouse.devices.blinds) }));

// Car charger
houseAgent.intentions.push(SenseCarChargerIntention);
houseAgent.postSubGoal(new SenseCarChargerGoal({ carCharger: myDailyHouse.devices.carCharger }));
houseAgent.intentions.push(SenseStartCarChargingIntention);
houseAgent.postSubGoal(new SenseStartCarChargingGoal({ carCharger: myDailyHouse.devices.carCharger }));
houseAgent.intentions.push(SenseFullBatteryChargingIntention);
houseAgent.postSubGoal(new SenseFullBatteryChargingGoal({ carCharger: myDailyHouse.devices.carCharger }));
houseAgent.intentions.push(SenseStopCarChargingIntention);
houseAgent.postSubGoal(new SenseStopCarChargingGoal({ carCharger: myDailyHouse.devices.carCharger }));

// Floor heaters
heaterAgent.intentions.push(SenseFloorHeatersIntention);
heaterAgent.postSubGoal(new SenseFloorHeatersGoal({ heater: Object.values(myDailyHouse.devices.heater) }));
heaterAgent.intentions.push(SenseTemperatureIntention);
heaterAgent.postSubGoal(new SenseTemperatureGoal({ heater: Object.values(myDailyHouse.devices.heater), high: 22, medium: 20, low: 18 }));
heaterAgent.intentions.push(SenseHeatOccupiedRoomIntention);
heaterAgent.postSubGoal(new SenseHeatOccupiedRoomGoal({ heater: Object.values(myDailyHouse.devices.heater) }));
heaterAgent.intentions.push(SenseMediumTemperatureUnoccupiedRoomIntention);
heaterAgent.postSubGoal(new SenseMediumTemperatureUnoccupiedRoomGoal({ heater: Object.values(myDailyHouse.devices.heater) }));
heaterAgent.intentions.push(SenseLowTemperatureUnoccupiedRoomIntention);
heaterAgent.postSubGoal(new SenseLowTemperatureUnoccupiedRoomGoal({ heater: Object.values(myDailyHouse.devices.heater), unoccupationTime: 120 }));

// Lights
lightAgent.intentions.push(SenseLightsIntention);
lightAgent.postSubGoal(new SenseLightsGoal({ lights: Object.values(myDailyHouse.devices.lights) }));
lightAgent.intentions.push(SenseIntensityIntention);
lightAgent.postSubGoal(new SenseIntensityGoal({ lights: Object.values(myDailyHouse.devices.lights), low: 25, high: 75 }));
lightAgent.intentions.push(SenseAutoLightRoomOccupancyIntention);
lightAgent.postSubGoal(new SenseAutoLightRoomOccupancyGoal({ lights: Object.values(myDailyHouse.devices.lights) }));
lightAgent.intentions.push(SenseAutoTurnOnLightIntention);
lightAgent.intentions.push(SenseAutoTurnOffLightIntention);
lightAgent.intentions.push(SenseSetIntensityManuallyIntention);
lightAgent.postSubGoal(new SenseSetIntensityManuallyGoal({
    light: myDailyHouse.devices.lights.bedroomLight, hh: 00, mm: 00, intensityToAdd: -60}));
lightAgent.postSubGoal(new SenseSetIntensityManuallyGoal({
    light: myDailyHouse.devices.lights.bedroomLight, hh: 06, mm: 31, intensityToAdd: +30}));
lightAgent.postSubGoal(new SenseSetIntensityManuallyGoal({
    light: myDailyHouse.devices.lights.kitchenLight, hh: 08, mm: 26, intensityToAdd: +20}));
lightAgent.postSubGoal(new SenseSetIntensityManuallyGoal({
    light: myDailyHouse.devices.lights.bathroomLight, hh: 19, mm: 55, intensityToAdd: +100}));
lightAgent.postSubGoal(new SenseSetIntensityManuallyGoal({
    light: myDailyHouse.devices.lights.livingroomLight, hh: 21, mm: 35, intensityToAdd: -40}));
lightAgent.postSubGoal(new SenseSetIntensityManuallyGoal({
    light: myDailyHouse.devices.lights.bedroomLight, hh: 23, mm: 25, intensityToAdd: -60}));
                                                              
// Vacuum cleaner
vacuumAgent.device = myDailyHouse.devices.vacuumCleaner;
vacuumAgent.intentions.push(SenseBatteryIntention);
vacuumAgent.postSubGoal(new SenseBatteryGoal({ vacuumCleaner: myDailyHouse.devices.vacuumCleaner }));
vacuumAgent.intentions.push(SenseVacuumCleanerPositionIntention);
vacuumAgent.postSubGoal(new SenseVacuumCleanerPositionGoal({ vacuumCleaner: myDailyHouse.devices.vacuumCleaner }));
vacuumAgent.intentions.push(SenseCleanRoomIntention);
vacuumAgent.postSubGoal(new SenseCleanRoomGoal({
    rooms:[myDailyHouse.rooms.bathroom, myDailyHouse.rooms.bedroom, myDailyHouse.rooms.kitchen, myDailyHouse.rooms.livingroom]}));
let { OnlinePlanning } = require("../pddl/OnlinePlanner")([Move, FirstChargeClean, SecondChargeClean, Charge]);
vacuumAgent.intentions.push(OnlinePlanning);
vacuumAgent.intentions.push(SenseRetryFourTimesIntention);
vacuumAgent.postSubGoal(new SenseRetryGoal({goal: new PlanningGoal({
    goal: ["cleaned livingroom", "cleaned kitchen", "cleaned bedroom", "cleaned bathroom", "highCharge"]}), hh: 10, mm: 00}));

// Initial beliefset
vacuumAgent.beliefs.declare("base livingroom");
vacuumAgent.beliefs.declare("door livingroom kitchen");
vacuumAgent.beliefs.declare("door livingroom bedroom");
vacuumAgent.beliefs.declare("door kitchen livingroom");
vacuumAgent.beliefs.declare("door kitchen bathroom");
vacuumAgent.beliefs.declare("door bedroom livingroom");
vacuumAgent.beliefs.declare("door bedroom bathroom");
vacuumAgent.beliefs.declare("door bathroom kitchen");
vacuumAgent.beliefs.declare("door bathroom bedroom");

module.exports = { myDailyHouse };