import User from "../models/User.js";
import Address from "../models/Address.js";
import dotenv from 'dotenv';
import axios from "axios";
dotenv.config()


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
        if (data.isDefault) {
            await Address.updateMany(
                { userId },
                { isDefault: false }
            )
        }
        const address = await Address.create({
            userId,
            label: data.label,
            name: data.name,
            phone: data.phone,
            house: data.house,
            locality: data.locality,
            state: data.state,
            pincode: data.pincode,
            country: data.country,
            isDefault: data.isDefault,
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
export const fetchAddress = async (req, res) => {
    const { lat, lng } = req.query;
    try {
        const response = await axios.get(
            "https://geocode.maps.co/reverse", {
            params: {
                lat: lat,
                lon: lng,
                api_key: process.env.GEOCODING_API_KEY,
            }
        }
        );
        const address = response.data.address;
        return res.status(200).json({
            locality: address.suburb + " " + address.city_block,
            state: address.city,
            pincode: address.postcode,
            country: address.country,
            road: address.street
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch location"
        });
    }
}
export const profileUpdate = async (req, res) => {
    try {
        const userId = req.user.id;
        const { email, phone } = req.body;

        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const now = Date.now();
        const lastUpdate = user.lastProfileUpdate;
        if (lastUpdate && now - lastUpdate < 24 * 60 * 60 * 1000) {
            return res.status(429).json({
                message: "Profile can only be updated once every 24 hours"
            });
        }
        if (email) user.email = email;
        if (phone) user.phone = phone;
        user.lastProfileUpdate = now;
        await user.save();
        res.status(200).json({ message: "User Updated Successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Backend Error"
        });
    }
}