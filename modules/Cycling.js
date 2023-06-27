import { Workout } from './modules/Workout.js';

export class Cycling extends Workout {
    type = "cycling";
    constructor(coords, distance, duration, elevation) {
        super(coords, distance, duration);
        this.elevation = elevation;
        this.calcSpeed();
        this.setDescribition();
    }

    calcSpeed() {
        // Km/h
        this.speed = this.distance / (this.duration / 60);
    }
}
