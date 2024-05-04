import { GraphQLScalarType, GraphQLError } from "graphql";
import validator from "validator";

const valiDate = (value) => {
  if (validator.isISO8601(value)) {
    return value;
  }
  throw new GraphQLError("DateTime must be a valid ISO 8601 date string", {
    extensions: { code: "BAD_USER_INPUT" },
  });
};

const DateTimeType = new GraphQLScalarType({
  name: "DateTime",
  description: "An ISO 8601-encoded UTC date string",
  parseValue: valiDate,
  serialize: (value) => {
    if (typeof value !== "string") {
      value = value.toISOString();
    }
    if (validator.isISO8601(value)) {
      return value;
    }
    throw new GraphQLError("DateTime must be a valid ISO 8601 date string", {
      extensions: { code: "BAD_USER_INPUT" },
    });
    //   valiDate(value);
  },
  parseLiteral: (ast) => {
    if (valiDate(ast.value)) {
      return ast.value;
    }
    throw new GraphQLError("DateTime must be a valid ISO 8601 date string", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  },
});

export default DateTimeType;
