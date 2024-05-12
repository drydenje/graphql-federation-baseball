import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

import { GraphQLError } from "graphql";
import { defaultFieldResolver } from "graphql";
import { getDirectives, MapperKind, mapSchema } from "@graphql-tools/utils";
import { get } from "lodash-es";

function authDirectives() {
  /* 
    Return an object containing the auth-related 
    directive definitions plus a function that 
    will transform Object type fields in the 
    subgraph schema to handle the directives, 
    where applied
  */
  const __dirname = dirname(fileURLToPath(import.meta.url));

  return {
    authDirectivesTypeDefs: readFileSync(
      resolve(__dirname, "./authDirectives.graphql"),
      "utf-8"
    ),
    authDirectivesTransformer: (schema) =>
      mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
          // Directive handling logic will go here...
          const fieldDirectives = getDirectives(schema, fieldConfig);

          const privateDirective = fieldDirectives.find(
            (dir) => dir.name === "private"
          );

          const ownerDirective = fieldDirectives.find(
            (dir) => dir.name === "owner"
          );

          const { resolve = defaultFieldResolver } = fieldConfig;

          if (privateDirective || ownerDirective) {
            fieldConfig.resolve = function (source, args, context, info) {
              const privateAuthorized = privateDirective && context.user?.sub;

              const ownerArgAuthorized =
                ownerDirective &&
                context.user?.sub &&
                get(args, ownerDirective.args.argumentName) ===
                  context.user.sub;

              if (
                (privateDirective && !privateAuthorized) ||
                (ownerDirective && !ownerArgAuthorized)
              ) {
                throw new GraphQLError(
                  "You are not authorized to perform this action.",
                  {
                    extensions: {
                      code: "FORBIDDEN",
                    },
                  }
                );
              }

              return resolve(source, args, context, info);
            };

            return fieldConfig;
          }
        },
      }),
  };
}

export default authDirectives;
