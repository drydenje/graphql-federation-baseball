import { MongoDataSource } from "apollo-datasource-mongodb";
import { GraphQLError } from "graphql";
// need MongoDataSource from docs

class ProfilesDataSource {
  // extends MongoDataSource {
  constructor({ Profile }) {
    // super();
    this.Profile = Profile;
  }

  getProfile(filter) {
    return this.Profile.findOne(filter).exec();
  }

  getProfiles() {
    return this.Profile.find({}).exec();
  }

  async getProfileById(id) {
    return this.Profile.findById(id).exec();
  }

  _formatTags(tags) {
    return tags.map((tag) => tag.replace(/\s+/g, "-").toLowerCase());
  }

  createProfile(profile) {
    if (profile.interests) {
      const formattedTags = this._formatTags(profile.interests);
      profile.interests = formattedTags;
    }

    const newProfile = new this.Profile(profile);
    return newProfile.save();
  }
}

export default ProfilesDataSource;
