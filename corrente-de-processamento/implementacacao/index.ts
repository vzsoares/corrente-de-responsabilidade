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
