import User from "../models/User.js";

export const userRes = async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    return res.json(user);
}