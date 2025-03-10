
const user = require("../schema/newUserSchema.js");
const UserInfo = require("../schema/UserInfoSchema.js");

module.exports = {
    searchUsername: async (req, res) => {
        try {
            const query = { username: { $regex: req.params.username, $options: 'i' } };
            const data = await user.find(query).select('username fname lname pic ').limit(15);
            res.send(data)
        } catch (error) {
            console.error('Error during search:', error);
        }
    },
    addHistory: async (req, res) => {
        try {
            const isuser = await UserInfo.findOne({ info: req.user._id });

            if (isuser) {
                isuser.searchHistory.pull(req.params.username);
                isuser.searchHistory.push(req.params.username);

                await isuser.save();
            } else {
                const newUser = new UserInfo({
                    info: req.user._id,
                    searchHistory: [req.params.username],
                });

                await newUser.save();
            }

            res.send("ok");
        } catch (error) {
            console.log(error);
            res.send({
                message: "An error occurred",
                color: "red",
            });
        }
    },
    serachHistory: async (req, res) => {
        try {
            const thatuser = await UserInfo.findOne({ info: req.user._id }).select('searchHistory').limit(10);

            if (!thatuser) {
                return res.send({ his: { searchHistory: [] }, userid: req.user._id });
            }
            res.send({ his: thatuser, userid: req.user._id });

        } catch (error) {
            console.error(error);
            return res.send({ color: "red", message: error.message });
        }
    },
    deleteHistory: async (req, res) => {
        try {
            const result = await UserInfo.updateOne(
                { info: req.user._id },
                { $pull: { searchHistory: req.params.username } }
            );

            if (result.modifiedCount === 0) {
                return res.status(404).send({
                    color: "red",
                    message: "History item not found.",
                });
            }

            res.send({ color: "green", message: "Delete successful" });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                color: "red",
                message: "An error occurred while deleting history.",
            });
        }
    }
}
