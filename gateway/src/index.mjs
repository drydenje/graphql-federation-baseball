import http from "http";
import app from "./config/app.mjs";
import initGateway from "./config/apollo.mjs";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import cors from "cors";

const port = process.env.PORT;
const httpServer = http.createServer(app);

const gateway = initGateway(httpServer);
await gateway.start();

app.use(
  "/",
  cors(),
  express.json(),
  expressMiddleware(gateway, {
    context: async ({ req }) => {
      const user = req.auth || null;
      return { user };
    },
  })
);

await new Promise((resolve) => httpServer.listen({ port }, resolve));
console.log(`Gateway ready at http://localhost:${port}`);
