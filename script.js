'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class UUID {
    constructor() { }
    static generate() {
        const randomNumber = Math.random().toString(36).substring(2, 36);
        return btoa(`${randomNumber}-${btoa(`${randomNumber}-${randomNumber}`)}`);
    }
}

class Workout {
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

class Running extends Workout {
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

class Cycling extends Workout {
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

class App {
    #workouts = [];
    #map;
    #mapEvent;
    constructor() {
        this.#getPosition();
        form.addEventListener('submit', this.#newWorkout.bind(this));
        inputType.addEventListener('change', this.#toggleElevationFeild);
        containerWorkouts.addEventListener('click', this.#showInMap.bind(this));
    }

    #getPosition() {
        navigator.geolocation.getCurrentPosition(this.#loadMap.bind(this), () => { alert("Turn on your GPS !!!") })
    }

    #showInMap(event) {
        if (event.target.closest('.workout')) {
            let id = event.target.closest('.workout').dataset.id;
            let coords = this.#workouts.find(workout => workout.id === id)?.coords;
            this.#map.flyTo(coords, 13);
        }
    }
    #renderWorkoutMarker(workout) {
        let popupContent = `${workout.type == "running" ? "🏃" : "🚴‍♀️"}  ${workout.describtion}`;
        L.marker(workout.coords)
            .addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth: 200,
                minWidth: 150,
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`
            }))
            .setPopupContent(popupContent)
            .openPopup();
    }

    #renderWorkout(workout) {
        let HTML = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
            <h2 class="workout__title">${workout.describtion}</h2>
            <div class="workout__details">
                <span class="workout__icon">${workout.type == "running" ? "🏃" : "🚴‍♀️"}</span>
                <span class="workout__value">${workout.distance}</span>
                <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⏱</span>
                <span class="workout__value">${workout.duration}</span>
                <span class="workout__unit">min</span>
            </div>
        `;

        if (workout.type === "cycling") {
            HTML += `
                <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.speed.toFixed(1)}</span>
                <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⛰</span>
                <span class="workout__value">${workout.elevation}</span>
                <span class="workout__unit">m</span>
            </div>
        </li>`
        }
        if (workout.type === "running") {
            HTML += `
                <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.cadence}</span>
                <span class="workout__unit">min/km</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">🦶🏼</span>
                <span class="workout__value">${workout.pace.toFixed(1)}</span>
                <span class="workout__unit">spm</span>
            </div>
        </li>
            `;
        }

        form.insertAdjacentHTML('afterend', HTML);
    }

    #loadWorkouts() {
        if (this.#getLocalStorage()) {
            this.#workouts = this.#getLocalStorage();
            this.#workouts.forEach(workout => {
                this.#renderWorkoutMarker(workout);
                this.#renderWorkout(workout);
            })
        }
    }

    #loadMap(position) {
        let { longitude, latitude } = position.coords;
        let coords = [latitude, longitude];
        this.#map = L.map('map').setView(coords, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        this.#map.on('click', this.#showForm.bind(this));
        this.#loadWorkouts();
    }

    #showForm(event) {
        form.classList.remove('hidden');
        this.#mapEvent = event;
        inputDistance.focus();
    }

    #hideForm() {
        form.classList.add('hidden');
    }

    #clearForm() {
        inputElevation.value = inputCadence.value = inputDuration.value = inputDistance.value = '';
    }

    #toggleElevationFeild() {
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    }

    #newWorkout(e) {
        e.preventDefault();
        let workout;
        let distance = Number(inputDistance.value);
        let duration = Number(inputDuration.value);
        let cadence = Number(inputCadence.value);
        let elevation = Number(inputElevation.value);
        let type = inputType.value;
        let { lat: latitude, lng: longitude } = this.#mapEvent.latlng;
        let coords = [latitude, longitude];

        const checkIsANumber = (...numbers) => numbers.every(number => Number.isFinite(number))
        const IsNumberPositive = (...numbers) => numbers.every(number => number > 0)

        // validate inputs
        if (type === "cycling") {
            if (
                checkIsANumber(distance, duration, elevation)
                &&
                IsNumberPositive(distance, duration, elevation)
            ) {
                workout = new Cycling(coords, distance, duration, elevation);
            } else {
                return alert("Invalid input : Just numbers allowed !")
            }
        }
        else if (type === "running") {
            if (
                checkIsANumber(distance, duration, cadence)
                &&
                IsNumberPositive(distance, duration, cadence)
            ) {
                workout = new Running(coords, distance, duration, cadence);
            } else {
                return alert("Invalid input : Just numbers allowed !")
            }
        }

        this.#workouts.push(workout);
        this.#renderWorkoutMarker(workout);
        this.#renderWorkout(workout);
        this.#clearForm();
        this.#hideForm();
        this.#setLocalStorage();
    };

    #setLocalStorage() {
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));
    }

    #getLocalStorage() {
        return JSON.parse(localStorage.getItem('workouts'))
    }
}

const app = new App();