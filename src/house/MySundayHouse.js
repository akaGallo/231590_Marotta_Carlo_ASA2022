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

// My Sunday House
class SundayHouse {
    constructor () {
        this.people = { carlo: new Person(this, 'Carlo', 'outside') };

        this.rooms = {
            livingroom: { name: "livingroom", doorTo: ["kitchen", "bedroom", "garage"], cleaned: true },
            kitchen: { name: "kitchen", doorTo: ["livingroom", "bathroom"], cleaned: false },
            bedroom: { name: "bedroom", doorTo: ["livingroom", "bathroom"], cleaned: false },
            bathroom: { name: "bathroom", doorTo: ["kitchen", "bedroom"], cleaned: true },
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
                livingroomHeater: new FloorHeater(this, "livingroom", 22),
                kitchenHeater: new FloorHeater(this, "kitchen", 19),
                bedroomHeater: new FloorHeater(this, "bedroom", 20),
                bathroomHeater: new FloorHeater(this, "bathroom", 21)
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
var mySundayHouse = new SundayHouse();
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
roomAgent.postSubGoal(new SenseRoomOccupancyGoal({ people: Object.values(mySundayHouse.people) }));

// Alarm
houseAgent.intentions.push(AlarmIntention);
houseAgent.postSubGoal(new AlarmGoal({ hh: 10, mm: 30 }));

// Washing machine
houseAgent.intentions.push(SenseWashingMachineIntention);
houseAgent.postSubGoal(new SenseWashingMachineGoal({ washingMachine: mySundayHouse.devices.washingMachine }));
houseAgent.intentions.push(SenseTurnOnWashingMachineIntention);
houseAgent.postSubGoal(new SenseTurnOnWashingMachineGoal({ washingMachine: mySundayHouse.devices.washingMachine }));
houseAgent.intentions.push(SenseRunningWashingMachineIntention);
houseAgent.postSubGoal(new SenseRunningWashingMachineGoal({ washingMachine: mySundayHouse.devices.washingMachine }));
houseAgent.intentions.push(SenseTurnOffWashingMachineIntention);
houseAgent.postSubGoal(new SenseTurnOffWashingMachineGoal({ washingMachine: mySundayHouse.devices.washingMachine }));

// Blinds
houseAgent.intentions.push(SenseBlindsIntention);
houseAgent.postSubGoal(new SenseBlindsGoal({ blinds: Object.values(mySundayHouse.devices.blinds) }));
houseAgent.intentions.push(SenseRaiseBlindsIntention);
houseAgent.postSubGoal(new SenseRaiseBlindsGoal({ blinds: Object.values(mySundayHouse.devices.blinds) }));
houseAgent.intentions.push(SenseLowerBlindsIntention);
houseAgent.postSubGoal(new SenseLowerBlindsGoal({ blinds: Object.values(mySundayHouse.devices.blinds) }));

// Car charger
houseAgent.intentions.push(SenseCarChargerIntention);
houseAgent.postSubGoal(new SenseCarChargerGoal({ carCharger: mySundayHouse.devices.carCharger }));
houseAgent.intentions.push(SenseStartCarChargingIntention);
houseAgent.postSubGoal(new SenseStartCarChargingGoal({ carCharger: mySundayHouse.devices.carCharger }));
houseAgent.intentions.push(SenseFullBatteryChargingIntention);
houseAgent.postSubGoal(new SenseFullBatteryChargingGoal({ carCharger: mySundayHouse.devices.carCharger }));
houseAgent.intentions.push(SenseStopCarChargingIntention);
houseAgent.postSubGoal(new SenseStopCarChargingGoal({ carCharger: mySundayHouse.devices.carCharger }));

// Floor heaters
heaterAgent.intentions.push(SenseFloorHeatersIntention);
heaterAgent.postSubGoal(new SenseFloorHeatersGoal({ heater: Object.values(mySundayHouse.devices.heater) }));
heaterAgent.intentions.push(SenseTemperatureIntention);
heaterAgent.postSubGoal(new SenseTemperatureGoal({ heater: Object.values(mySundayHouse.devices.heater), high: 22, medium: 20, low: 18 }));
heaterAgent.intentions.push(SenseHeatOccupiedRoomIntention);
heaterAgent.postSubGoal(new SenseHeatOccupiedRoomGoal({ heater: Object.values(mySundayHouse.devices.heater) }));
heaterAgent.intentions.push(SenseMediumTemperatureUnoccupiedRoomIntention);
heaterAgent.postSubGoal(new SenseMediumTemperatureUnoccupiedRoomGoal({ heater: Object.values(mySundayHouse.devices.heater) }));
heaterAgent.intentions.push(SenseLowTemperatureUnoccupiedRoomIntention);
heaterAgent.postSubGoal(new SenseLowTemperatureUnoccupiedRoomGoal({ heater: Object.values(mySundayHouse.devices.heater), unoccupationTime: 120 }));

// Lights
lightAgent.intentions.push(SenseLightsIntention);
lightAgent.postSubGoal(new SenseLightsGoal({ lights: Object.values(mySundayHouse.devices.lights) }));
lightAgent.intentions.push(SenseIntensityIntention);
lightAgent.postSubGoal(new SenseIntensityGoal({ lights: Object.values(mySundayHouse.devices.lights), low: 25, high: 75 }));
lightAgent.intentions.push(SenseAutoLightRoomOccupancyIntention);
lightAgent.postSubGoal(new SenseAutoLightRoomOccupancyGoal({ lights: Object.values(mySundayHouse.devices.lights) }));
lightAgent.intentions.push(SenseAutoTurnOnLightIntention);
lightAgent.intentions.push(SenseAutoTurnOffLightIntention);
lightAgent.intentions.push(SenseSetIntensityManuallyIntention);
lightAgent.postSubGoal(new SenseSetIntensityManuallyGoal({
    light: mySundayHouse.devices.lights.bedroomLight, hh: 01, mm: 57, intensityToAdd: -60}));
lightAgent.postSubGoal(new SenseSetIntensityManuallyGoal({
    light: mySundayHouse.devices.lights.bedroomLight, hh: 10, mm: 31, intensityToAdd: +50}));
lightAgent.postSubGoal(new SenseSetIntensityManuallyGoal({
    light: mySundayHouse.devices.lights.garageLight, hh: 11, mm: 51, intensityToAdd: +50}));
lightAgent.postSubGoal(new SenseSetIntensityManuallyGoal({
    light: mySundayHouse.devices.lights.bedroomLight, hh: 22, mm: 55, intensityToAdd: -100}));
                                                              
// Vacuum cleaner
vacuumAgent.device = mySundayHouse.devices.vacuumCleaner;
vacuumAgent.intentions.push(SenseBatteryIntention);
vacuumAgent.postSubGoal(new SenseBatteryGoal({ vacuumCleaner: mySundayHouse.devices.vacuumCleaner }));
vacuumAgent.intentions.push(SenseVacuumCleanerPositionIntention);
vacuumAgent.postSubGoal(new SenseVacuumCleanerPositionGoal({ vacuumCleaner: mySundayHouse.devices.vacuumCleaner }));
vacuumAgent.intentions.push(SenseCleanRoomIntention);
vacuumAgent.postSubGoal(new SenseCleanRoomGoal({
    rooms:[mySundayHouse.rooms.bathroom, mySundayHouse.rooms.bedroom, mySundayHouse.rooms.kitchen, mySundayHouse.rooms.livingroom]}));
let { OnlinePlanning } = require("../pddl/OnlinePlanner")([Move, FirstChargeClean, SecondChargeClean, Charge]);
vacuumAgent.intentions.push(OnlinePlanning);
vacuumAgent.intentions.push(SenseRetryFourTimesIntention);
vacuumAgent.postSubGoal(new SenseRetryGoal({goal: new PlanningGoal({
    goal: ["cleaned livingroom", "cleaned kitchen", "cleaned bedroom", "cleaned bathroom", "mediumCharge"]}), hh: 16, mm: 00}));

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

module.exports = { mySundayHouse };