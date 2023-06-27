import { UUID } from './modules/UUID.js';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export class Workout {
    id = UUID.generate();
    date = new Date();

    constructor(coords, distance, duration) {
        this.coords = coords;
        this.distance = distance;
        this.duration = duration;
    }

    setDescribition() {
        // ${this.type == "running" ? "🏃" : "🚴‍♀️"}
        let date = `${months[this.date.getMonth()]} ${this.date.getDate()}`;
        let [firstLetter, ...rest] = this.type;
        let type = `${firstLetter.toUpperCase()}${rest.join('')}`;

        this.describtion = `${type} on ${date}`;
    }
}
