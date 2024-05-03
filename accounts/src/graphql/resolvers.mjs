import auth0 from "../config/auth0.mjs";
import getToken from "../utils/getToken.mjs";
import { GraphQLError } from "graphql";

const resolvers = {
  Account: {
    __resolveReference(reference) {
      return auth0.users.get({ id: reference.id });
    },
    id(account) {
      return account.user_id;
    },
    createdAt(account) {
      return account.created_at;
    },
  },

  Query: {
    async account(root, { id }) {
      const account = await auth0.users.get({ id });

      return account.data;
    },

    async accounts(root, args) {
      const accounts = await auth0.users.getAll();

      return accounts.data;
    },

    async viewer(parent, args, { user }) {
      if (user?.sub) {
        const viewer = await auth0.users.get({ id: user.sub });

        return viewer.data;
      }
      return null;
    },
  },

  Mutation: {
    async createAccount(parent, { input: { email, password } }) {
      const newUser = await auth0.users.create({
        connection: "Username-Password-Authentication",
        email,
        password,
      });

      return newUser.data;
    },

    async updateAccountEmail(root, { input: { id, email } }) {
      const updateEmail = await auth0.users.update({ id }, { email });

      return updateEmail.data;
    },

    async updateAccountPassword(
      root,
      { input: { id, newPassword, password } }
    ) {
      const user = await auth0.users.get({ id });

      try {
        await getToken(user.data.email, password);
      } catch {
        throw new GraphQLError("Email or existing password is incorrect.", {
          extensions: {
            code: "USER_INPUT_ERROR ",
          },
        });
      }

      const updatePassword = await auth0.users.update(
        { id },
        { password: newPassword }
      );

      return updatePassword.data;
    },

    async deleteAccount(root, { id }) {
      try {
        // this isn't triggering an error when it doesn't delete
        const deleteUser = await auth0.users.delete({ id });
        console.log(deleteUser);

        return true;
      } catch {
        return false;
      }
    },
  },
};

export default resolvers;
