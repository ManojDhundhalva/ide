export const getUser = async (req, res) => {
    const { identity } = req;

    const userDto = {
        _id: identity._id,
        email: identity.email,
        name: identity.name,
        image: identity.image
    };

    return res.status(200).json({ message: "User retrieved successfully", identity, user: userDto });
};
