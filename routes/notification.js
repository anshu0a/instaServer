
const UserInfo = require("../schema/UserInfoSchema.js");
const mongo = require("mongoose");


module.exports = {

    allNotification: async (req, res) => {
        try {
            const { _id } = req.params;

            if (!mongo.Types.ObjectId.isValid(_id)) {
                return res.send({ message: "Invalid user ID", color: "red" });
            }

            const isuser = await UserInfo.findOne({ info: _id })
                .select("info Notifications")
                .populate({
                    path: "Notifications.sender",
                    select: "username pic",
                });

            if (isuser && isuser.Notifications) {

                const unseenCount = isuser.Notifications.filter(notification => !notification.seen).length;

                return res.send({
                    data: isuser,
                    no: unseenCount,
                });
            }

            res.send({ data: [], no: 0 });
        } catch (error) {
            console.error(error);
            res.status(500).send({
                message: "An error occurred",
                color: "red",
            });
        }
    },
    deleteNotifications : async (req, res) => {
        const { notiid } = req.params;
    
        try {
    
            const isuser = await UserInfo.findOne({ info: req.user._id });
    
            if (!isuser) {
                return res.send({ message: "User not found", color: "red" });
            }
            isuser.Notifications.pull({ _id: notiid });
            await isuser.save()
    
            return res.send({
                message: `Notification Deleted`,
                color: "green",
            });
    
    
        } catch (error) {
            console.error("Error updating notification:", error);
            res.status(500).send({
                message: "An error occurred while deleting.",
                color: "red",
            });
        }
    },
    
    seenNotification: async (req, res) => {
        const { type, notiid } = req.params;
    
        try {
    
            const isuser = await UserInfo.findOne({ info: req.user._id });
    
            if (!isuser) {
                return res.send({ message: "User not found", color: "red" });
            }
    
    
            if (type === "read" || type === "unread" || type === "allread") {
                if (type === "allread") {
                    isuser.Notifications = isuser.Notifications.map((noti) => ({ ...noti, seen: true, }));
                } else {
                    const seenStatus = type === "read";
                    isuser.Notifications = isuser.Notifications.map((noti) =>
                        noti._id.toString() === notiid ? { ...noti, seen: seenStatus } : noti
                    );
                }
    
                await isuser.save();
    
    
                return res.send({
                    message: `Notification marked as ${type}.`,
                    color: "green",
                });
            }
            else {
                return res.send({
                    message: "Invalid type parameter.",
                    color: "red",
                });
            }
        } catch (error) {
            console.error("Error updating notification:", error);
            res.status(500).send({
                message: "An error occurred while updating notifications.",
                color: "red",
            });
        }
    }
}