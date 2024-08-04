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
            if (/^[\x00-\x7F]*$/.test(name)) {
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
