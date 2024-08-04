import express, { Router } from "express";

const app = express();

const routes = Router();

routes.use(
    "/",
    (
        req: express.Request,
        res: express.Response,
        _next: express.NextFunction,
    ) => {
        const name = req.query["name"];
        if (name) {
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
        //@ts-expect-error eeee
        res.status(err?.status || 500).send();
    },
);

export { app };
