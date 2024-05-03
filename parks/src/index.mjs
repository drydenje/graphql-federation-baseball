import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

import { ApolloServer } from "@apollo/server";
import { gql } from "graphql-tag";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { startStandaloneServer } from "@apollo/server/standalone";

import resolvers from "./graphql/resolvers.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT;

const typeDefs = gql(
  readFileSync(resolve(__dirname, "./graphql/schema.graphql"), "utf-8")
);

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
  context: ({ req }) => {
    console.log("USER:", req);
    const user = req.headers.user ? JSON.parse(req.headers.user) : null;
    return { user };
  },
});

const { url } = await startStandaloneServer(server, {
  context: async ({ req, res }) => ({ token: await req.headers.token }),
  listen: { port },
});
console.log(`Accounts service ready at ${url}`);
