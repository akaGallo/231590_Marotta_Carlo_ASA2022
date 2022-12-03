# **Autonomous Software Agents**

University of Trento - Trento, 2022

Carlo Marotta - carlo.marotta@studenti.unitn.it

## **Project structure**

- src/bdi/ - contains agent, beliefset, goal and intention files
- src/devices/ - contains devices files
- src/house/ - contains home files
- src/houseworld/ - contains devices intentions and goals files
- src/observable/ - contains person file
- src/pddl/ - contains pddl files
- src/scenario/ - contains scenario files
- src/utils/ - contains clock and observable files

## **Scenario**

### **People**

People are managed by a daily and a Sunday schedule in the scenario files

- Carlo

### **Rooms**

- livingroom
- kitchen
- bedroom
- bathroom
- garage

### **Devices**

#### **Blind**

Blinds provide external lighting and take 5 minutes for their opening and closing:

- livingroomBlind
- kitchenBlind
- bedroomBlind
- bathroomBlind

#### **Car charger**

Car charger is located in the garage and provides a full charge of the car

#### **Floor heater**

Floor heaters provide heating to the rooms:

- livingroomHeater
- kitchenHeater
- bedroomHeater
- bathroomHeater

#### **Light**

Lights provide illumination to the rooms

- livingroomLight
- kitchenLight
- bedroomLight
- bathroomLight
- garageLight

#### **Vacuum cleaner**

Vacuum cleaner provides a Planning Domain Definition Language (PDDL) for cleaning the rooms

#### **Washing machine**

Washing machine is located in the bathroom and provides three types of wash cycle each with a cycle time:

- cottons, 1 hour and a half
- synthetics, 1 hour
- delicates, half an hour

### **Goal and intentions**

#### **Alarm sensor**

Alarm sensor is managed in the house files and working is influenced by the set time

- AlarmGoal, AlarmIntention: provides a wake-up message

#### **Blinds sensors**

Blinds sensors are managed by raise and lower function calls in the scenario files

- SenseBlindsGoal, SenseBlindsIntention: provides notification of status change
- SenseRaiseBlindsGoal, SenseRaiseBlindsIntention: provides execution of blinds raising
- SenseLowerBlindsGoal, SenseLowerBlindsIntention: provides execution of blinds lowering

#### **Car charger sensors**

Car charger sensors are managed by the start function call in the scenario files

- SenseCarChargerGoal, SenseCarChargerIntention: provides notification of status change
- SenseStartCarChargingGoal, SenseStartCarChargingIntention: provides execution of car charger boot
- SenseFullBatteryChargingGoal, SenseFullBatteryChargingIntention: provides execution of car battery full charging
- SenseStopCarChargingGoal, SenseStopCarChargingIntention: provides execution of car charger shutdown

#### **Floor heaters sensors**

Floor heater sensors are handled by daily and Sunday schedules in the scenario files and reading is influenced by room occupancy

- SenseFloorHeatersGoal, SenseFloorHeatersIntention: provides notification of status change
- SenseTemperatureGoal, SenseTemperatureIntention: provides notification of temperature change
- SenseHeatOccupiedRoomGoal, SenseHeatOccupiedRoomIntention: provides execution of occupied room heating
- SenseMediumTemperatureUnoccupiedRoomGoal, SenseMediumTemperatureUnoccupiedRoomIntention: provides pull-down to the medium temperature of an unoccupied room
- SenseLowTemperatureUnoccupiedRoomGoal, SenseLowTemperatureUnoccupiedRoomIntention: provides pull-down to the low temperature of an unoccupied room after a certain amount of time

#### **Lights sensors**

Light sensors are handles by daily and Sunday schedules in the scenario file and reading is influenced by room occupancy

- SenseLightsGoal, SenseLightsIntention: provides notification of status change
- SenseIntensityGoal, SenseIntensityIntention: provides notification of intensity change
- SenseAutoLightRoomOccupancyGoal, SenseAutoLightRoomOccupancyIntention: provides notification of occupation room change
- SenseAutoTurnOnLightGoal, SenseAutoTurnOnLightIntention: provides execution of room self-illumination
- SenseAutoTurnOffLightGoal, SenseAutoTurnOffLightIntention: provides execution of room automatic light switch-off
- SenseSetIntensityManuallyGoal, SenseSetIntensityManuallyIntention: provides execution of manual increase/decrease of light intensity

#### **Room occupancy sensor**

Room occupancy sensor is managed by daily and Sunday schedules in the scenario file and reading is influenced by people movements

- SenseRoomOccupancyGoal, SenseRoomOccupancyIntention: provides notification of room occupied change by people

#### **Vacuum cleaner sensors**

Vacuum cleaner sensors are managed in the house files and working is influenced by the set time

- SenseBatteryGoal, SenseBatteryIntention: provides notification of battery change
- SenseVacuumCleanerPositionGoal, SenseVacuumCleanerPositionIntention: provides notification of position change
- SenseCleanRoomGoal, SenseCleanRoomIntention: provides notification of room cleaning change
- SenseRetryGoal, SenseRetryFourTimesIntention: provides execution of real-time cleaning by the vacuum cleaner

#### **Washing machine sensors**

Washing machine sensors are handled by the start function call in the scenario files

- SenseWashingMachineGoal, SenseWashingMachineIntention: provides notification of status change
- SenseTurnOnWashingMachineGoal, SenseTurnOnWashingMachineIntention: provides execution of washing machine turning on
- SenseRunningWashingMachineGoal, SenseRunningWashingMachineIntention: provides execution of washing machine cycle running
- SenseTurnOffWashingMachineGoal, SenseTurnOffWashingMachineIntention: provides execution of washing machine turning off

## **Agents**

### **Room Agent**

The room agent manages the room occupancy of the house.
The initial beliefset is defined in the Person file.

### **House Agent**

The house agent manages the devices (Alarm, WashingMachine, CarCharger and Blinds) of the house.
The initial beliefset is defined in each device file.

### **Heater Agent**

The heater agent manages the floor heating of the house.
The initial beliefset is defined in both the FloorHeater file and the house files.

### **Light Agent**

The light agent manages the illumination of the house.
The initial beliefset is defined in both the Light file and the house files.

### **Vacuum Agent**

The vacuum cleaner agent manages the vacuum cleaner working.
The initial beliefset is defined in both the VacuumCleaner file and the house files.

## **PDDL domain - PDDL problem**

The robot vacuum cleaner can move between adjoining rooms, can clean as long as the battery is medium, and can perform a full charge when the battery is low.

PDDL files located in src/houseworld/tmp/:

- **domain-VacuumCleanerAgent.pddl** - vacuum cleaner agent pddl domain file 
- **problem-VacuumCleanerAgent.pddl** - vacuum cleaner agent pddl problem file

The vacuum cleaner .pddl domain provides 7 pddl predicates:

- **inRoom** - indicates the vacuum cleaner current room
- **door** - indicates the chance to change room
- **highCharge** - indicates high battery charge
- **cleaned** - indicates a clean room
- **mediumCharge** - indicates medium battery charge
- **lowCharge** - indicates low battery charge
- **base** - indicates the location of the charging base

and 4 pddl actions:

- **Move** - the vacuum cleaner moves from a room to another one
- **FirstChargeClean** - the vacuum cleaner cleans the room when it has high battery
- **SecondChargeClean** - the vacuum cleaner cleans the room when it has medium battery
- **Charge** - the vacuum cleaner charges the battery

## **Run**

### **Run a daily scenario**

node mainDaily.js

### **Run a Sunday scenario**

node mainSunday.js

## **Report**

[231590_Marotta_Carlo_ASA2022.pdf]

## **GIT link**

(https://github.com/akaGallo/Smart-house-ASA2022)