import User from "../models/User.js";

export const UserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        return res.status(201).json(user);
    } catch (error) {
        return res.status(500).json({ message: "user Not Found" });
    }
}