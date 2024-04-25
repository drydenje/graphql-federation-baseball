import auth0 from "../config/auth0.mjs";

const accounts = [
  {
    id: "1",
    email: "marked@mandiwise.com",
  },
];

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

    async accounts() {
      console.log("test");
      const accounts = await auth0.users.get();
      console.log("ACC:", accounts);
      // return accounts.data;

      return auth0.getUsers({ per_page: 10, page: 1 }, function (err, users) {
        console.log(users.length);
      });
    },

    async viewer(parent, args, { user }) {
      if (user?.sub) {
        const viewer = await auth0.users.get({ id: user.sub });

        return viewer.data;
      }
      return null;
    },
  },
};

export default resolvers;
