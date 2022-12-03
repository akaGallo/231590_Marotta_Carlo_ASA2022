const Goal = require("../bdi/Goal")
const Intention = require("../bdi/Intention")

class SenseRoomOccupancyGoal extends Goal {}

class SenseRoomOccupancyIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SenseRoomOccupancyGoal;
    }
    
    *exec({people} = parameters) {
        var peopleGoals = [];
        for (let p of people) {
            let peopleGoalPromise = new Promise(async (res) => {
                while (true) {
                    let room = await p.notifyChange("inRoom");
                    if (room !== "outside") {
                        this.log("Sensor: " + p.name + " is in " + room);
                        this.log("Sensor: " + p.name + " is inside the house");
                    } else {
                        this.log("Sensor: " + p.name + " is outside");
                    }
                    for (let r in p.house.rooms) {
                        this.agent.beliefs.declare(p.name + " is in " + p.house.rooms[r].name, p.house.rooms[r].name == room);
                        let inRoom = false;
                        for (let pr of people) {
                            inRoom = inRoom || this.agent.beliefs.check(pr.name + " is in " + p.house.rooms[r].name);
                        }
                        this.agent.beliefs.declare(p.house.rooms[r].name + " is occupied", inRoom);
                    }
                    let inHouse = false;
                    for (let h in p.house.rooms) {
                        inHouse = inHouse || this.agent.beliefs.check(p.house.rooms[h].name + " is occupied");
                    }
                    this.agent.beliefs.declare("the house is occupied", inHouse);
                }
            });
            peopleGoals.push(peopleGoalPromise);
        }
        yield Promise.all(peopleGoals);
    }
}

module.exports = {
    SenseRoomOccupancyGoal, SenseRoomOccupancyIntention
};