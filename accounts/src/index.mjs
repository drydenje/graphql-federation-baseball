import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

import { ApolloServer } from "@apollo/server";
import { gql } from "graphql-tag";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { startStandaloneServer } from "@apollo/server/standalone";
import auth0 from "./config/auth0.mjs";

import resolvers from "./graphql/resolvers.mjs";
import AccountsDataSource from "./graphql/dataSources/AccountsDataSource.mjs";
import { authDirectives } from "../../shared/src/index.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT;

const { authDirectivesTypeDefs, authDirectivesTransformer } = authDirectives();

// const typeDefs = gql(
//   readFileSync(resolve(__dirname, "./graphql/schema.graphql"), "utf-8")
// );

const subgraphTypeDefs = readFileSync(
  resolve(__dirname, "./graphql/schema.graphql"),
  "utf-8"
);

const typeDefs = gql(`${subgraphTypeDefs}\n${authDirectivesTypeDefs}`);
let subgraphSchema = buildSubgraphSchema({ typeDefs, resolvers });
subgraphSchema = authDirectivesTransformer(subgraphSchema);

const server = new ApolloServer({
  // schema: buildSubgraphSchema({ typeDefs, resolvers }),
  schema: subgraphSchema,
});

const { url } = await startStandaloneServer(server, {
  context: async ({ req, res }) => {
    const user = req.headers.user ? JSON.parse(req.headers.user) : null;
    // console.log("USER:", user);
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
