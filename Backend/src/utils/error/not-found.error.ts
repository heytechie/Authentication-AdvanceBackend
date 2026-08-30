import { AppError } from "./AppError.js";

export class notFound extends AppError {
    constructor(message = "Not Found") {
        super(message, 404);
    }
}