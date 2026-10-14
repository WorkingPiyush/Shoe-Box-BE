import User from "../models/User.js"
export const getUser = async (id) => {
    const user = await User.findOne({ _id: id });
    return user
}