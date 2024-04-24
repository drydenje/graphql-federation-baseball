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
      return accounts.find((account) => account.id === reference.id);
    },
  },
  Query: {
    async viewer(parent, args, { user }) {
      const viewer = await auth0.users.get({ id: user.sub });
      // console.log("RESOLVER->USER: ", viewer);
      return accounts[0];
    },
  },
};

export default resolvers;
