import {
    result as input,
    result2 as input2,
    result3 as input3,
    result4 as input4,
} from "../base";

type Result = { success: boolean; data: object; message?: string };

interface Handler {
    setNext(handler: Handler): Handler;
    handle(request: unknown): Result;
    hasNextHandler: boolean;
}

abstract class AbstractHandler implements Handler {
    private nextHandler: Handler | undefined;
    public get hasNextHandler(): boolean {
        return !!this.nextHandler;
    }

    public setNext(handler: Handler): Handler {
        this.nextHandler = handler;
        return handler;
    }
    public handle(request: unknown) {
        if (this.nextHandler) {
            return this.nextHandler.handle(request);
        }
        return { success: false, data: {}, message: "not processed" };
    }
}

class Base64Handler extends AbstractHandler {
    public handle(data: unknown) {
        try {
            if (typeof data === "string") {
                const r = atob(data);
                return super.handle(r);
            } else throw new Error("data not string");
        } catch (error) {
            return { success: false, data: {}, message: "invalid base64" };
        }
    }
}

class JsonHandler extends AbstractHandler {
    public handle(data: string) {
        try {
            const r = JSON.parse(data);
            if (!r) return { success: false, data: {}, message: "no content" };
            return super.handle(r);
        } catch (error) {
            return { success: false, data: {}, message: "invalid json" };
        }
    }
}

class RootValidatorHandler extends AbstractHandler {
    public handle(data: string) {
        // check operation
        if (!["UPDATE", "CREATE", "DELETE"].includes(`${data["operation"]}`)) {
            return {
                success: false,
                data: {},
                message: "invalid operation",
            };
        }
        // check source
        if (!["mazden", "pinejot", "zordia"].includes(`${data["source"]}`)) {
            return {
                success: false,
                data: {},
                message: "source discontinued",
            };
        }
        return super.handle(data);
    }
}

class DomainRulesValidatorHandler extends AbstractHandler {
    public handle(data: string) {
        if (
            data["operation"] === "UPDATE" &&
            data["options"]?.["force"] === true
        ) {
            if (data["source"] === "pinejot") {
                return {
                    success: false,
                    data: {},
                    message: "cannot force update for client pinejot",
                };
            }
        }
        if (data["data"]?.["age"] > 21 && data["data"]?.["country"] === "BRA") {
            return {
                success: false,
                data: {},
                message: "forbiden age for brazil",
            };
        }

        if (this.hasNextHandler) return super.handle(data);
        else return { success: true, data: data["data"] as object };
    }
}

const base64Handler = new Base64Handler();
const jsonHandler = new JsonHandler();
const rootValidatorHandler = new RootValidatorHandler();
const domainRulesValidatorHandler = new DomainRulesValidatorHandler();

base64Handler
    .setNext(jsonHandler)
    .setNext(rootValidatorHandler)
    .setNext(domainRulesValidatorHandler);

const requestHandler = base64Handler;

async function process(raw: unknown): Promise<Result> {
    return requestHandler.handle(raw);
}

process(input).then((r) => console.log(r));
process(input2).then((r) => console.log(r));
process(input3).then((r) => console.log(r));
process(input4).then((r) => console.log(r));
