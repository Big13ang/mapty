export class UUID {
    constructor() { }
    static generate() {
        const randomNumber = Math.random().toString(36).substring(2, 36);
        return btoa(`${randomNumber}-${btoa(`${randomNumber}-${randomNumber}`)}`);
    }
}
