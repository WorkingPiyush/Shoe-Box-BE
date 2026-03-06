import User from "../models/User.js";

export const userRes = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        return res.status(201).json(user);
    } catch (error) {
        return res.status(500).json({ message: "user Not Found" });
    }
}

export const updateInfo = async (req, res) => {
    const { fullName, phone, street, city, state, pincode, country, type } = req.body;
    const user = await User.findById(req.user.id);
    try {
        user.fullName = fullName;
        user.phone = phone;
        user.addresses.street = street;
        user.addresses.city = city;
        user.addresses.state = state;
        user.addresses.pincode = pincode;
        user.addresses.country = country;
        user.type = type;
        await user.save();
        console.log(user)
        return res.status(201).json(user);
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}