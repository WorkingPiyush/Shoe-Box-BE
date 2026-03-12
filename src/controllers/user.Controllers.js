import User from "../models/User.js";
import Address from "../models/Address.js";

export const UserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: "user Not Found" });
    }
}
export const updateAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = req.body;
        const { id } = req.params;

        const address = await Address.findOne({ _id: id, userId });
        if (!address) {
            return res.status(400).json({ message: "No Address Found !!" })
        }
        address.label = data.label;
        address.name = data.name;
        address.phone = data.phone;
        address.house = data.house;
        address.locality = data.locality;
        address.state = data.state;
        address.pincode = data.pincode;
        address.country = data.country;
        if (data.label === "Home" || data.label === "Work") {
            address.isDefault = true;
        }
        await address.save()
        return res.status(200).json(address);
    } catch (error) {
        return res.status(500).json({ message: "Server Error", err: error.message });
    }
}
export const AddressBook = async (req, res) => {
    try {
        const userId = req.user.id;
        const addressDoc = await Address.find({ userId }).lean();
        return res.status(200).json(addressDoc || []);
    } catch (error) {
        return res.status(500).json({ message: "Server Error", err: error.message });
    }
}
export const addAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = req.body;
        let address = await Address.create({
            userId,
            label: data.label,
            name: data.name,
            phone: data.phone,
            house: data.house,
            locality: data.locality,
            state: data.state,
            pincode: data.pincode,
            country: data.country,
            isDefault: ["Home", "Work"].includes(data.label)
        });
        return res.status(200).json(address);
    } catch (error) {
        return res.status(500).json({ message: "Backend Error", err: error.message });
    }

}
export const deleteAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Please provide address id" });
        }
        const result = await Address.deleteOne({ _id: id, userId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Address not found" });
        }
        return res.status(200).json({ message: "Address Deleted" });
    } catch (error) {
        return res.status(500).json({ message: "Backend Error", err: error.message });
    }
}