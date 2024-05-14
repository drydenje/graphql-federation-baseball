// import { DataSource } from ""
import { GraphQLError } from "graphql";

// need MongoDataSource from docs

class ProfilesDataSource extends MongoDataSource {
  constructor({ Profile }) {
    super();
    this.Profile = Profile;
  }

  getProfile(filter) {
    return this.Profile.findOne(filter).exec();
  }

  getProfiles() {
    return this.Profile.find({}).exec();
  }

  getProfileById(id) {
    return this.Profile.findById(id).exec();
  }
}

export default ProfilesDataSource;
