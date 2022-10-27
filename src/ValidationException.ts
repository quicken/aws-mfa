/**
 * A custom error type for throwing validation exceptions.
 */
export class ValidationException extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
