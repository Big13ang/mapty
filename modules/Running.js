import { Workout } from '/modules/Workout.js';

export class Running extends Workout {
    type = "running";
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this.setDescribition();
    }

    calcPace() {
        // min/Km
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}