import express, { Router } from "express";
import { z } from "zod";

export class CustomError extends Error {
    message: string;
    code: string;
    constructor(
        message = "Something wrong happened ):",
        code: string = "U500E",
    ) {
        super(message);
        this.message = message;
        this.code = code;
    }
}

const baseApp = express();

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

baseApp.use(express.json());

baseApp.use("/", routes);

baseApp.use((_req: express.Request, res: express.Response) => {
    res.status(404).send();
});

export default baseApp;
