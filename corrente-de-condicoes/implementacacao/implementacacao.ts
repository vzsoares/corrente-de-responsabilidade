import express, { Router } from "express";
import { z } from "zod";

import { AppErrorHandler, CustomError } from "./errorHandler";

const app = express();

const routes = Router();

const helloSchema = z.object({ name: z.string().optional() }).strict();

routes.use(
    "/hello",
    (
        req: express.Request,
        res: express.Response,
        _next: express.NextFunction,
    ) => {
        const query = helloSchema.parse(req.query);
        const name = query.name;

        if (req.method === "DELETE") {
            //@ts-expect-error intentional mistake
            res.status(501).send(`${name.length}`);
        }
        if (name) {
            if (name === "bob")
                throw new CustomError("I dont like you bob", "E6214");
            //@ts-expect-error unknown error
            if (name === "foo") doSomething(name);
            if (!/^[\x00-\x7F]*$/.test(name)) {
                throw new CustomError("Invalid character", "E7512");
            }
            res.status(200).send(`Hello ${name}`);
        } else res.status(200).send("Hello World");
    },
);

app.use(express.json());

app.use("/", routes);

app.use((_req: express.Request, res: express.Response) => {
    res.status(404).send();
});

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
