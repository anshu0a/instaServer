
const msgData = require("../schema/msgData.js");



module.exports = {
    msgList: async function (req, res) {
        const { forwhat } = req.params;
        try {
            const lists = await msgData.aggregate([
                {
                    $match: {
                        $or: [
                            { sender: req.user._id },
                            { reciever: req.user._id }
                        ]
                    }
                },
                {
                    $addFields: {
                        chatWith: {
                            $cond: [
                                { $ne: ["$sender", req.user._id] },
                                "$sender",
                                "$reciever"
                            ]
                        }
                    }
                },
                {
                    $sort: { msgtime: -1 }
                },
                {
                    $group: {
                        _id: "$chatWith",
                        lastMessage: { $first: "$$ROOT" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        chatWith: "$_id",
                        lastMessage: 1
                    }
                },
                {
                    $sort: { "lastMessage.msgtime": 1 }
                }
            ]);

            const populatedChats = await msgData.populate(lists, [
                {
                    path: "chatWith",
                    model: "alluser",
                    select: "fname username pic online"
                },
                {
                    path: "lastMessage.sender",
                    model: "alluser",
                    select: "fname username pic online"
                }
            ]);

            if (forwhat === "chat") {
                res.status(200).json({ user: req.user, data: populatedChats });
            } else {
                if (populatedChats.length > 0) {
                    const filteredChats = populatedChats.filter(chat => {
                        return (chat.lastMessage?.seen === false && chat.lastMessage.reciever.toString() === req.user._id.toString());
                    });
                    res.send({ len: filteredChats.length, data: filteredChats });
                } else {
                    res.send({ len: 0, data: [] });
                }
            }
        } catch (error) {
            console.error("Error fetching message list:", error);
            res.status(500).json({ color: "red", message: "An error occurred" });
        }
    },
    oneChat:async (req, res) => {
        const user2 = req.params.user2;
        try {
            await msgData.updateMany({ sender: user2, reciever: req.user._id }, { $set: { seen: true }, });
            const msgs = await msgData.find({ $or: [{ sender: user2, reciever: req.user._id }, { reciever: user2, sender: req.user._id }] }).sort({ msgtime: 1 });
            if (msgs.length > 0) {
    
                res.send({ msgs: msgs, user: req.user })
    
            } else {
                res.send({ msgs: "no msg" })
            }
    
        } catch (error) {
            console.error("Server-side error:", error);
    
            res.status(500).send({
                message: "Server-side error",
                color: "red"
            });
        }
    },
   
};
