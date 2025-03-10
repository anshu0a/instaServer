
const followData = require("../schema/followData.js");

module.exports = {
    followStatus: async (req, res) => {
        const { two } = req.params;
        const one = req.user._id;
        if (!two) {
            return res.json({ message: "Invalid user", color: "red" });
        }
        try {
            const exist = await followData.findOne({
                $or: [{ user1: one, user2: two }, { user1: two, user2: one }]
            });

            if (exist) {
                if (exist.user1.toString() == one && exist.user2.toString() == two) {
                    res.send("Unfollow")
                } else {
                    if (exist.back) {
                        res.send("Unfollow")
                    } else {
                        res.send("Follow back")

                    }
                }
            } else {
                res.send("Follow")
            }

        } catch (error) {
            console.log(error);
            res.send({
                message: "An error occurred",
                color: "red",
            });
        }
    },
    followerFollowing: async (req, res) => {
        const { one } = req.params;
        if (!one) {
            return res.json({ message: "Invalid user", color: "red" });
        }
        try {

            const list = await followData.find({
                $or: [{ user1: one }, { user2: one }]
            })
                .populate("user1", "pic username _id")
                .populate("user2", "pic username _id");
            const mylist = await followData.find({
                $or: [{ user1: req.user._id }, { user2: req.user._id }]
            });
            res.send({ list: list, user: req.user, mylist: mylist })

        } catch (error) {
            console.log(error);
            res.send({
                message: "An error occurred",
                color: "red",
            });
        }
    },
}