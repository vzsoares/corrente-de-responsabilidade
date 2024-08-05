import { z } from "zod";
import { CustomError } from "../baseApp";

interface Handler {
    setNext(handler: Handler): Handler;
    handle(request: unknown): null | ErrorData;
}

export interface ErrorData {
    statusCode: number;
    message: string;
    error: unknown;
    code: string;
}

abstract class AbstractHandler implements Handler {
    private nextHandler: Handler | undefined;
    public setNext(handler: Handler): Handler {
        this.nextHandler = handler;
        return handler;
    }
    public handle(request: unknown): null | ErrorData {
        if (this.nextHandler) {
            return this.nextHandler.handle(request);
        }
        return null;
    }
}

class ZodErrorHandler extends AbstractHandler {
    public handle(error: unknown): null | ErrorData {
        if (error instanceof Error) {
            if (error instanceof z.ZodError || error.name === "ZodError") {
                const castedError = error as z.ZodError;
                return {
                    statusCode: 400,
                    message: error.message,
                    error: castedError.flatten(),
                    code: "AC407E",
                };
            }
        }
        return super.handle(error);
    }
}

class CustomErrorHandler extends AbstractHandler {
    public handle(error: unknown): null | ErrorData {
        if (error instanceof CustomError) {
            let message = error.message;
            if (error.code === "E6214") message = "Black listed name";
            if (error.code === "E7512") message = "Name not ascii";
            return {
                statusCode: 400,
                message: message,
                error: error.stack,
                code: error.code,
            };
        }
        return super.handle(error);
    }
}

class NodeErrorHandler extends AbstractHandler {
    public handle(error: unknown): null | ErrorData {
        if (error instanceof Error) {
            const message = error.message;
            if (message.includes("Cannot read properties of undefined")) {
                return {
                    statusCode: 400,
                    message: "My code just blew",
                    error: error.stack,
                    code: "E256",
                };
            }
        }
        return super.handle(error);
    }
}

class UnknownErrorHandler extends AbstractHandler {
    public handle(error: unknown): null | ErrorData {
        return {
            statusCode: 500,
            message: "Something went wrong",
            error: (error as Error | undefined)?.message ?? "unknown error",
            code: "U500E",
        };
    }
}

const zodHandler = new ZodErrorHandler();
const customErrorHandler = new CustomErrorHandler();
const unknownErrorHandler = new UnknownErrorHandler();
const nodeErrorHandler = new NodeErrorHandler();
zodHandler
    .setNext(customErrorHandler)
    .setNext(nodeErrorHandler)
    .setNext(unknownErrorHandler);

export { zodHandler as AppErrorHandler };
