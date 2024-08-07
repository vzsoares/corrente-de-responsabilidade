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

type Context<T = unknown> = {
    data: T;
    options?: {
        raw?: boolean;
        touched?: boolean;
        special: boolean;
        valid?: boolean;
    };
};

abstract class AbstractHandler implements Handler {
    private nextHandler: Handler | undefined;
    public get hasNextHandler(): boolean {
        return !!this.nextHandler;
    }

    public setNext(handler: Handler): Handler {
        this.nextHandler = handler;
        return handler;
    }
    public handle(context: Context) {
        if (this.nextHandler) {
            return this.nextHandler.handle(context);
        }
        return { success: false, data: {}, message: "not processed" };
    }
}

class Base64HandlerV2 extends AbstractHandler {
    public handle(context: Context) {
        try {
            if (typeof context.data === "string") {
                const r = Buffer.from(context.data, "base64").toString("ascii");
                return super.handle({ ...context, data: r });
            } else throw new Error("data not string");
        } catch (error) {
            return { success: false, data: {}, message: "invalid base64" };
        }
    }
}

class Base64Handler extends AbstractHandler {
    public handle(context: Context) {
        try {
            if (typeof context.data === "string") {
                const r = atob(context.data);
                return super.handle({ ...context, data: r });
            } else throw new Error("data not string");
        } catch (error) {
            return { success: false, data: {}, message: "invalid base64" };
        }
    }
}

class JsonHandler extends AbstractHandler {
    public handle(context: Context<string>) {
        try {
            const r = JSON.parse(context.data);
            if (!r) return { success: false, data: {}, message: "no content" };
            return super.handle({ ...context, data: r });
        } catch (error) {
            return { success: false, data: {}, message: "invalid json" };
        }
    }
}

class RootValidatorHandler extends AbstractHandler {
    public handle(context: Context) {
        // check operation
        if (
            !["UPDATE", "CREATE", "DELETE"].includes(
                `${context.data?.["operation"]}`,
            )
        ) {
            return {
                success: false,
                data: {},
                message: "invalid operation",
            };
        }
        // check source
        if (
            !["mazden", "pinejot", "zordia"].includes(
                `${context.data?.["source"]}`,
            )
        ) {
            return {
                success: false,
                data: {},
                message: "source discontinued",
            };
        }
        return super.handle(context);
    }
}

class DomainRulesValidatorHandler extends AbstractHandler {
    public handle(context: Context) {
        if (
            context.data?.["operation"] === "UPDATE" &&
            context.data?.["options"]?.["force"] === true
        ) {
            if (context.data?.["source"] === "pinejot") {
                return {
                    success: false,
                    data: {},
                    message: "cannot force update for client pinejot",
                };
            }
        }
        if (
            context.data?.["data"]?.["age"] > 21 &&
            context.data?.["data"]?.["country"] === "BRA"
        ) {
            return {
                success: false,
                data: {},
                message: "forbiden age for brazil",
            };
        }

        if (this.hasNextHandler) return super.handle(context);
        else return { success: true, data: context["data"] as object };
    }
}

const base64Handler = new Base64HandlerV2();
const jsonHandler = new JsonHandler();
const rootValidatorHandler = new RootValidatorHandler();
const domainRulesValidatorHandler = new DomainRulesValidatorHandler();

base64Handler
    .setNext(jsonHandler)
    .setNext(rootValidatorHandler)
    .setNext(domainRulesValidatorHandler);

const requestHandler = base64Handler;

async function process(raw: unknown): Promise<Result> {
    const context: Context = { data: raw };
    return requestHandler.handle(context);
}

process(input).then((r) => console.log(r));
process(input2).then((r) => console.log(r));
process(input3).then((r) => console.log(r));
process(input4).then((r) => console.log(r));
