import { GraphQLError } from "graphql";
import { DateTimeType } from "../../../shared/src/index.mjs";

const resolvers = {
  DateTime: DateTimeType,

  Account: {
    __resolveReference(reference, { dataSources }) {
      if (user?.sub) {
        return dataSources.accountsAPI.getAccountById(reference.id);
      }
      throw new GraphQLError("You are not authorized to perform this action.", {
        extensions: {
          code: "FORBIDDEN",
        },
      });
    },
    id(account) {
      return account.user_id;
    },
    createdAt(account) {
      return account.created_at;
    },
  },

  Query: {
    async account(root, { id }, { dataSources }) {
      return dataSources.accountsAPI.getAccountById(id);
    },

    async accounts(root, args, { dataSources }) {
      return dataSources.accountsAPI.getAccounts();
    },

    async viewer(parent, args, { dataSources, user }) {
      if (user?.sub) {
        return dataSources.accountsAPI.getAccountById(user.sub);
      }
      return null;
    },
  },

  Mutation: {
    async createAccount(
      parent,
      { input: { email, password } },
      { dataSources }
    ) {
      return dataSources.accountsAPI.createAccount(email, password);
    },

    async deleteAccount(root, { id }, { dataSources }) {
      return dataSources.accountsAPI.deleteAccount(id);
    },

    async updateAccountEmail(root, { input: { id, email } }, { dataSources }) {
      return dataSources.accountsAPI.updateAccountEmail(id, email);
    },

    async updateAccountPassword(
      root,
      { input: { id, newPassword, password } },
      { dataSources }
    ) {
      return dataSources.accountsAPI.updateAccountPassword(
        id,
        newPassword,
        password
      );
    },
  },
};

export default resolvers;
