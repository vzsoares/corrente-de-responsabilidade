import {
    result as input,
    result2 as input2,
    result3 as input3,
    result4 as input4,
} from "../base";

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

type Result = { success: boolean; data: object; message?: string };

async function process(raw: unknown): Promise<Result> {
    // check base64
    let maybeBase64: string = "";
    try {
        if (typeof raw === "string") {
            const r = atob(raw);
            maybeBase64 = r;
        }
    } catch (error) {
        return { success: false, data: {}, message: "invalid base64" };
    }
    // check json
    let maybeJson: Record<string, unknown> | undefined = undefined;
    try {
        if (typeof raw === "string") {
            if (maybeBase64) {
                const r = JSON.parse(maybeBase64);
                maybeJson = r;
            } else {
                const r = JSON.parse(raw);
                maybeJson = r;
            }
        }
    } catch (error) {
        return { success: false, data: {}, message: "invalid json" };
    }
    if (!maybeJson) return { success: false, data: {}, message: "no content" };
    // check operation
    const data = maybeJson;
    if (!["UPDATE", "CREATE", "DELETE"].includes(`${data["operation"]}`)) {
        return { success: false, data: {}, message: "invalid operation" };
    }
    // check source
    if (!["mazden", "pinejot", "zordia"].includes(`${data["source"]}`)) {
        return { success: false, data: {}, message: "source discontinued" };
    }

    // check rules
    if (data["operation"] === "UPDATE" && data["options"]?.["force"] === true) {
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

    return { success: true, data: data["data"] as object };
}

process(input).then((r) => console.log(r));
process(input2).then((r) => console.log(r));
process(input3).then((r) => console.log(r));
process(input4).then((r) => console.log(r));
