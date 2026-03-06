import User from "../models/User.js";

export const handleOAuthUser = async ({ email, name, id, provider }) => {
    let newUser = await User.findOne({ email });
    if (newUser) {
        newUser.oauthProvider = provider;
        newUser.oauthId = id;
        newUser.isEmailVerified = true;
        await newUser.save();
    } else {
        newUser = await User.create({
            fullName: name,
            email,
            oauthProvider: provider,
            oauthId: id,
            isEmailVerified: true,
            emailVerifiedAt: Date.now(),
        })
    }
    return newUser;
}