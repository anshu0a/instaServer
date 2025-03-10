
const UserInfo = require("../schema/UserInfoSchema.js");
const mainData = require("../schema/mainData.js");
const User = require("../schema/newUserSchema.js");

module.exports = {
    edtrelationship: async (req, res) => {
        try {
            console.log(req.body);
            const { selectedStatus, show } = req.body;

            await User.findOneAndUpdate(
                { _id: req.user._id },
                { relationship: { show, typ: selectedStatus } },
                { new: true }
            );

            res.send({ message: "Relationship updated", color: "green" });
        } catch (error) {
            console.error("Error updating relationship:", error);
            res.status(500).send({ message: "Internal Server Error", color: "red" });
        }
    },
    addhelp: async (req, res) => {
        try {
            const { typ, inpdata } = req.body;
            let data = await mainData.findById(req.user._id);

            if (!data) {
                data = new mainData({
                    _id: req.user._id,
                    help: [{ type: typ, msg: inpdata }]
                });
            } else {
                data.help.push({ type: typ, msg: inpdata });
            }

            await data.save();

            const thankYouMsg = "We've received your help request, Our team is on it and will respond shortly (no need to worry).";

            await UserInfo.findOneAndUpdate(
                { info: req.user._id },
                { $pull: { Notifications: { sendertype: "msg", msg: thankYouMsg } } }
            );

            await UserInfo.findOneAndUpdate(
                { info: req.user._id },
                { $push: { Notifications: { sendertype: "msg", msg: thankYouMsg } } }
            );


            res.send({ message: "Help sent", color: "green" });
        } catch (error) {
            console.error("Error updating help data:", error);
            res.status(500).send({ message: "Internal Server Error", color: "red" });
        }
    },
    fetchhelp: async (req, res) => {
        try {
            let data = await mainData.aggregate([
                { $match: { _id: req.user._id } },
                {
                    $project: {
                        help: {
                            $slice: [
                                { $sortArray: { input: "$help", sortBy: { datex: -1 } } },
                                6
                            ]
                        }
                    }
                }
            ]);

            res.send({
                message: "Your previous help",
                color: "green",
                data: data.length > 0 ? data[0].help : []
            });
        } catch (error) {
            console.error("Error fetching help data:", error);
            res.status(500).send({ message: "Internal Server Error", color: "red" });
        }

    },
    deleteorreadhelp: async (req, res) => {
        const { typ, idx } = req.params;

        try {
            let data = await mainData.findById(req.user._id).select("help");
            if (!data) return res.status(404).send({ message: "Data not found", color: "red" });

            if (typ !== "deleted") {
                let index = data.help.findIndex(item => item._id.toString() === idx);
                if (index !== -1) {
                    data.help[index].respond = true;
                } else {
                    return res.status(404).send({ message: "Help entry not found", color: "red" });
                }
            } else {
                data.help.pull({ _id: idx });
            }

            await data.save();
            res.send({ message: `Help ${typ}.`, color: "green" });
        } catch (error) {
            console.error("Error updating help data:", error);
            res.status(500).send({ message: "Internal Server Error", color: "red" });
        }
    },
    feedbackSend: async (req, res) => {
        try {
            const feedbackMsg = req.body.inp?.trim();
            if (!feedbackMsg) {
                return res.status(400).json({
                    color: "red",
                    message: "Feedback cannot be empty",
                });
            }

            await mainData.findOneAndUpdate(
                { _id: req.user._id },
                { $push: { improve: { msg: feedbackMsg } } },
                { upsert: true, new: true }
            );

            const thankYouMsg = "A huge thank you for your valuable suggestion, I truly appreciate your time and insight.";

            await UserInfo.findOneAndUpdate(
                { info: req.user._id },
                { $pull: { Notifications: { sendertype: "msg", msg: thankYouMsg } } }
            );

            await UserInfo.findOneAndUpdate(
                { info: req.user._id },
                { $push: { Notifications: { sendertype: "msg", msg: thankYouMsg } } }
            );

            res.send({
                color: "green",
                message: "Suggestion submitted.",
            });

        } catch (error) {
            console.error("Error during suggestion submission:", error);
            res.status(500).send({
                color: "red",
                message: "Failed to submit suggestion. Please try again later.",
            });
        }


    },
    fetchsuggest: async (req, res) => {
        try {
            let data = await mainData.aggregate([
                { $match: { _id: req.user._id } },
                {
                    $project: {
                        improve: {
                            $slice: [
                                { $sortArray: { input: "$improve", sortBy: { datex: -1 } } },
                                6
                            ]
                        }
                    }
                }
            ]);

            res.send({
                message: "Your previous suggestions",
                color: "green",
                data: data.length > 0 ? data[0].improve : []
            });
        } catch (error) {
            console.error("Error fetching help data:", error);
            res.status(500).send({ message: "Internal Server Error", color: "red" });
        }

    },
    deleteorreadsuggest: async (req, res) => {
        const { typ, idx } = req.params;

        try {
            let data = await mainData.findById(req.user._id).select("improve");
            if (!data) return res.status(404).send({ message: "Data not found", color: "red" });

            if (typ !== "deleted") {
                let index = data.improve.findIndex(item => item._id.toString() === idx);
                if (index !== -1) {
                    data.improve[index].respond = true;
                } else {
                    return res.status(404).send({ message: "Suggestion entry not found", color: "red" });
                }
            } else {
                data.improve.pull({ _id: idx });
            }

            await data.save();
            res.send({ message: `suggestion ${typ}.`, color: "green" });
        } catch (error) {
            console.error("Error updating help data:", error);
            res.status(500).send({ message: "Internal Server Error", color: "red" });
        }
    },
    addreport: async (req, res) => {
        try {
            const { title, report, postid = null } = req.body;
            let data = await mainData.findById(req.user._id);

            if (!data) {
                data = new mainData({
                    _id: req.user._id,
                    report: [{ title, report, postid }]
                });
            } else {
                data.report.push({ title, report, postid });
            }

            await data.save();

            let thankYouMsg;
            if (postid !== null) {
                thankYouMsg = "Thank you for reporting this post. We have received your report and will review it as soon as possible to determine if it violates our community guidelines. Your effort in maintaining a safe and respectful environment is greatly appreciated. If further action is needed, we will take appropriate steps. Thank you for helping us improve the platform.";
            } else {
                thankYouMsg = "Thank you for reporting the issue regarding. Your report has been successfully submitted, and our team will carefully review it as soon as possible. We appreciate your effort in helping us improve the platform and ensure a better experience for everyone. If we need more details, we may reach out to you. Thank you for your patience and support.";
            }


            await UserInfo.findOneAndUpdate(
                { info: req.user._id },
                { $pull: { Notifications: { sendertype: "msg", msg: thankYouMsg } } }
            );

            await UserInfo.findOneAndUpdate(
                { info: req.user._id },
                { $push: { Notifications: { sendertype: "msg", msg: thankYouMsg } } }
            );


            res.send({ message: "Reported", color: "green" });
        } catch (error) {
            console.error("Error updating report data:", error);
            res.status(500).send({ message: "Internal Server Error", color: "red" });
        }
    },
    fetcreport: async (req, res) => {
        try {

            let data = await mainData.aggregate([
                { $match: { _id: req.user._id } },
                {
                    $project: {
                        report: {
                            $slice: [
                                { $sortArray: { input: "$report", sortBy: { datex: -1 } } },
                                6
                            ]
                        }
                    }
                },
                { $unwind: "$report" },
                {
                    $lookup: {
                        from: "postdatas",
                        localField: "report.postid",
                        foreignField: "_id",
                        as: "postDetails"
                    }
                },
                { $unwind: { path: "$postDetails", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        "report.title": 1,
                        "report._id": 1,
                        "report.datex": 1,
                        "report.report": 1,
                        "report.respond": 1,
                        "postDetails": 1
                    }
                }
            ]);

            res.send({
                message: "Your previous reports",
                color: "green",
                data: data
            });


        } catch (error) {
            console.error("Error fetching report data:", error);
            res.status(500).send({ message: "Internal Server Error", color: "red" });
        }


    },
    deleteorreadreport: async (req, res) => {
        const { typ, idx } = req.params;
        try {
            let data = await mainData.findById(req.user._id).select("report");
            if (!data) return res.status(404).send({ message: "Report not found", color: "red" });

            if (typ !== "deleted") {
                let index = data.report.findIndex(item => item._id.toString() === idx);
                if (index !== -1) {
                    data.report[index].respond = true;
                } else {
                    return res.status(404).send({ message: "Report entry not found", color: "red" });
                }
            } else {
                data.report = data.report.filter(item => item._id.toString() !== idx);
            }

            await data.save();
            res.send({ message: `Report ${typ}.`, color: "green" });
        } catch (error) {
            console.error("Error updating report data:", error);
            res.status(500).send({ message: "Internal Server Error", color: "red" });
        }

    },
}