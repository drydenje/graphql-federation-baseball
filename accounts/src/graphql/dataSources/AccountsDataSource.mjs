import { RESTDataSource } from "@apollo/datasource-rest";
import { GraphQLError } from "graphql";
import getToken from "../../utils/getToken.mjs";

class AccountsDataSource extends RESTDataSource {
  // pass auth0 to the class
  constructor({ auth0 }) {
    super();
    //
    this.auth0 = auth0;
  }

  async createAccount(email, password) {
    const newAccount = await this.auth0.users.create({
      connection: "Username-Password-Authentication",
      email,
      password,
    });

    return newAccount.data;
  }

  async updateAccountEmail(id, email) {
    const updateEmail = await this.auth0.users.update({ id }, { email });

    return updateEmail.data;
  }

  async updateAccountPassword(id, newPassword, password) {
    const user = await this.auth0.users.get({ id });

    try {
      await getToken(user.data.email, password);
    } catch {
      throw new GraphQLError("Email or existing password is incorrect.", {
        extensions: {
          code: "USER_INPUT_ERROR",
        },
      });
    }

    const updatePassword = await this.auth0.users.update(
      { id },
      { password: newPassword }
    );

    return updatePassword.data;
  }

  async deleteAccount(id) {
    try {
      const deleteUser = await this.auth0.users.delete({ id });

      return true;
    } catch {
      return false;
    }
  }

  async getAccountById(id) {
    const account = await this.auth0.users.get({ id });

    return account.data;
  }

  async getAccounts() {
    const accounts = await this.auth0.users.getAll();

    return accounts.data;
  }
}

export default AccountsDataSource;
