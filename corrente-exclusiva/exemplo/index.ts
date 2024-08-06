import { z } from "zod";
import express from "express";
import app, { CustomError } from "../baseApp";

app.use(
    (
        err: unknown,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction,
    ) => {
        console.log(err);

        if (err instanceof z.ZodError) {
            const result = err.flatten();
            res.status(400).send(result);
        }

        if (err instanceof CustomError) {
            const code = err.code;
            if (code === "E6214") res.status(400).send("Black listed name");

            if (code === "E7512") res.status(400).send("Name not ascii");
        }

        if (err instanceof Error) {
            const message = err.message;
            if (message.includes("Cannot read properties of undefined")) {
                console.log("Sending report to report center");
                res.status(400).send("My code just blew");
            }
        }

        res.status(500).send("Something went wrong!");
    },
);

app.listen(3000, () => {
    console.log(`Example app listening on port 3000`);
});
