import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

import { ApolloServer } from "@apollo/server";
import { gql } from "graphql-tag";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { startStandaloneServer } from "@apollo/server/standalone";

import { authDirectives } from "../../shared/src/index.mjs";
import initMongoose from "./config/mongoose.mjs";
import Profile from "./models/Profile.mjs";
import ProfilesDataSource from "./graphql/dataSources/ProfilesDataSources.mjs";
import resolvers from "./graphql/resolvers.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT;
initMongoose();

const { authDirectivesTypeDefs, authDirectivesTransformer } = authDirectives();

const subgraphTypeDefs = readFileSync(
  resolve(__dirname, "./graphql/schema.graphql"),
  "utf-8"
);

const typeDefs = gql(`${subgraphTypeDefs}\n${authDirectivesTypeDefs}`);
let subgraphSchema = buildSubgraphSchema({ typeDefs, resolvers });
subgraphSchema = authDirectivesTransformer(subgraphSchema);

const server = new ApolloServer({
  schema: subgraphSchema,
});

// console.log(subgraphSchema);

const { url } = await startStandaloneServer(server, {
  context: async ({ req, res }) => {
    const user = req.headers.user ? JSON.parse(req.headers.user) : null;

    return {
      user,
      dataSources: {
        profilesAPI: new ProfilesDataSource({ Profile }),
      },
    };
  },
  listen: { port },
});

// console.log(server.internals.state.schemaManager);
// console.log(url);

console.log(`Profiles service ready at ${url}`);
