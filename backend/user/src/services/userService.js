import { UserModel } from "../models/users.js";

export const getUserById = (id) => UserModel.findById(id);

export const getUserByEmail = (email) => UserModel.findOne({ email });

export const getUserBySessionToken = (sessionToken) => UserModel.findOne({ sessionToken });

export const createUser = (values) => new UserModel(values).save().then((user) => user.toObject());

export const isUserExistsByEmail = async (email) => {
  const exists = await UserModel.exists({ email });
  return !!exists;
};