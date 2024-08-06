import express from "express";
import app from "../baseApp";

import { AppErrorHandler } from "./errorHandler";

app.use(
    (
        err: unknown,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction,
    ) => {
        console.log(err);
        const errData = AppErrorHandler.handle(err);

        res.status(errData?.statusCode ?? 500).send(
            errData?.message ?? "Something went wrong",
        );
    },
);

app.listen(3000, () => {
    console.log(`Example app listening on port 3000`);
});
