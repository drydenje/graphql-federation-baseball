import { GraphQLError } from "graphql";
import { DateTimeType } from "../../../shared/src/index.mjs";

const resolvers = {
  DateTime: DateTimeType,

  Query: {
    async profile(root, { username }, { dataSources }) {
      const profile = await dataSources.profilesAPI.getProfile({ username });

      if (!profile) {
        throw new GraphQLError("Profile not available", {
          extensions: {
            code: "PROFILE_NOT_AVAILABLE",
          },
        });
      }
      return profile;
    },
    profiles(root, args, { dataSources }) {
      return dataSources.profilesAPI.getProfiles();
    },
  },

  Account: {
    profile(account, args, { dataSources }) {
      return dataSources.profilesAPI.getProfile({
        accountId: account.id,
      });
    },
  },

  Profile: {
    __resolveReference(reference, { dataSources, user }) {
      if (user?.sub) {
        return dataSources.profilesAPI.getProfileById(reference.id);
      }
      throw new GraphQLError("Not authorized", {
        extensions: {
          code: "FORBIDDEN",
        },
      });
    },

    account(profile) {
      return { id: profile.accountId };
    },

    id(profile) {
      return profile._id;
    },
  },
};

export default resolvers;
