import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

import { ApolloServer } from "@apollo/server";
import { gql } from "graphql-tag";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { startStandaloneServer } from "@apollo/server/standalone";
import AccountsDataSource from "./graphql/dataSources/AccountsDataSource.mjs";
import auth0 from "./config/auth0.mjs";
import resolvers from "./graphql/resolvers.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT;

const typeDefs = gql(
  readFileSync(resolve(__dirname, "./graphql/schema.graphql"), "utf-8")
);

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
});

const { url } = await startStandaloneServer(server, {
  context: async ({ req, res }) => {
    const user = req.headers.user ? JSON.parse(req.headers.user) : null;

    return {
      user,
      dataSources: {
        accountsAPI: new AccountsDataSource({ auth0 }),
      },
    };
  },
  listen: { port },
});
console.log(`Accounts service ready at ${url}`);
