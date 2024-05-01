import auth0 from "../config/auth0.mjs";

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
      const temp = await auth0.users.create({
        connection: "Username-Password-Authentication",
        email,
        password,
      });
      console.log(temp);
      return temp.data;
    },
  },
};

export default resolvers;
