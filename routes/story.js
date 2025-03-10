
const UserInfo = require("../schema/UserInfoSchema.js");
const followData = require("../schema/followData.js");
const { removeimage } = require("../cloudconfig.js")




module.exports = {
    fetchclose: async (req, res) => {
        try {
            const followlist = await followData.find({
                back: true,
                $or: [{ user1: req.user._id }, { user2: req.user._id }]
            })
                .populate({
                    path: 'user1 user2',
                    select: 'username pic'
                })
                .lean();

            if (followlist.length === 0) {
                return res.send({ allclose: [], closelist: [] });
            }

            const close = await UserInfo.findOne({ info: req.user._id })
                .populate({ path: "closefrnd.user", select: "username pic" })
                .select("closefrnd")
                .lean();

            const closeFriends = close?.closefrnd?.map(({ user }) => ({
                _id: user._id,
                pic: user.pic,
                username: user.username
            })) || [];


            const filteredFollowList = followlist
                .map(follow => {
                    const otherUser = follow.user1._id.toString() === req.user._id.toString()
                        ? follow.user2
                        : follow.user1;

                    return closeFriends.some(c => c._id.toString() === otherUser._id.toString())
                        ? null
                        : otherUser;
                })
                .filter(Boolean);

            res.send({ allclose: filteredFollowList, closelist: closeFriends });

        } catch (e) {
            console.error(e);
            res.status(500).send({ message: "server-side error", color: "red" });
        }
    },
    addclosefrnd: async (req, res) => {
        try {
            const { list } = req.body;

            if (!Array.isArray(list)) {
                return res.send({ message: "Invalid data format", color: "red" });
            }

            const newlist = list.map((one) => ({ user: one._id }));
            const userdata = await UserInfo.findOneAndUpdate({ info: req.user._id }, { closefrnd: newlist }, { new: true });

            if (!userdata) {
                return res.send({ message: "User not found", color: "red" });
            }
            res.send({ message: "Close friends updated.", color: "green" });

        } catch (e) {
            console.error("Error in /closebhezo:", e);
            res.send({ message: "Server-side error", color: "red" });
        }
    },
    hidelist: async (req, res) => {
        console.log("hello")
        try {
            const followlist = await followData.find({
                $or: [{ user1: req.user._id, back: true }, { user2: req.user._id }]
            })
                .populate({
                    path: 'user1 user2',
                    select: 'username pic'
                })
                .lean();

            if (followlist.length === 0) {
                return res.send({ allfollower: [], hidelist: [] });
            }

            const hide = await UserInfo.findOne({ info: req.user._id })
                .populate({ path: "hideStory.user", select: "username pic" })
                .select("hideStory")
                .lean();

            const hideFriends = hide?.hideStory?.map(({ user, datex }) => ({
                _id: user?._id,
                pic: user?.pic,
                username: user?.username,
                datex
            })) || [];

            const filteredFollower = followlist
                .map(follow => {
                    const otherUser = follow.user1._id.toString() === req.user._id.toString()
                        ? follow.user2
                        : follow.user1;

                    if (hideFriends.some(h => h._id.toString() === otherUser._id.toString())) {
                        return null;
                    }

                    return {
                        ...otherUser,
                        datex: Date.now() + 30 * 24 * 60 * 60 * 1000
                    };
                })
                .filter(Boolean);


            res.send({ allfollower: filteredFollower, hidelist: hideFriends });


        } catch (e) {
            console.error(e);
            res.status(500).send({ message: "server-side error", color: "red" });
        }
    },
    addhidelist: async (req, res) => {
        try {
            const { list } = req.body;

            if (!Array.isArray(list)) {
                return res.send({ message: "Invalid data format", color: "red" });
            }

            const newlist = list.map((one) => ({ user: one._id, datex: Date.now() + 30 * 24 * 60 * 60 * 1000 }));
            const userdata = await UserInfo.findOneAndUpdate({ info: req.user._id }, { hideStory: newlist }, { new: true });

            if (!userdata) {
                return res.send({ message: "User not found", color: "red" });
            }
            res.send({ message: "Hide list updated.", color: "green" });

        } catch (e) {
            console.error("Error in /hidebhezo:", e);
            res.send({ message: "Server-side error", color: "red" });
        }
    },


    addstory: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded!", color: "red" });
            }

            const userdata = await UserInfo.findOne({ info: req.user._id });

            if (!userdata) {
                return res.status(404).json({ message: "User not found!", color: "red" });
            }


            const data = {
                content: {
                    path: req.file.path,
                    filename: req.file.filename
                },
                msg: req.body.msg,
                type: req.body.type,
                sharewith: req.body.sharewith
            };


            userdata.story.push(data);


            await userdata.save();


            res.json({ message: "File uploaded successfully!", color: "green" });

        } catch (error) {
            console.error("Upload error:", error);
            res.status(500).json({ message: "Server error", color: "red" });
        }
    },
    fetchStory: async (req, res) => {
        try {
            let allStory = await UserInfo.find({ "story.0": { $exists: true } })
                .select("story info")
                .populate({ path: "info", select: "pic username fname" })
                .lean();

            if (!allStory.length) return res.send({ mystory: [], allinonestory: [] });

            const userIds = allStory.map((onestory) => onestory.info?._id).filter(Boolean);
            if (!userIds.length) return res.send({ mystory: [], allinonestory: [] });

            const userData = await UserInfo.find({ info: { $in: userIds } })
                .select("info hideStory closefrnd")
                .lean();

            const userMap = new Map();
            userData.forEach((user) => userMap.set(user.info.toString(), user));

            const followdata = await followData.find({
                $or: [{ back: true, user2: req.user._id }, { user1: req.user._id }]
            });

            const myfollowing = followdata.map((onefollower) =>
                onefollower.user1.toString() === req.user._id.toString()
                    ? onefollower.user2.toString()
                    : onefollower.user1.toString()
            );

            let myfollowerstory = [];
            let mystory = [];
            let otherstory = [];

            for (const onestory of allStory) {
                if (!onestory.info?._id) continue;

                const user = userMap.get(onestory.info._id.toString());
                if (!user) continue;

                const isHiddenForCurrentUser = user.hideStory?.some(hiddenUser =>
                    hiddenUser.user?.toString() === req.user._id.toString()
                );

                const isCloseFriend = user.closefrnd?.some(friend =>
                    friend.user?.toString() === req.user._id.toString()
                );

                let filteredStoryList = [];

                for (const one of onestory.story) {
                    if (!one.sharewith) continue;

                    const seenUser = one.seen?.find(seenUser =>
                        seenUser.user.toString() === req.user._id.toString()
                    );
                    const isSeen = !!seenUser;
                    const isLike = seenUser ? seenUser.like : false;

                    const { seen, ...storyWithoutSeen } = one;
                    const storyWithFlags = { ...storyWithoutSeen, isSeen, isLike };

                    if (onestory.info._id.toString() === req.user._id.toString()) {
                        filteredStoryList.push(storyWithFlags);
                    } else if (isHiddenForCurrentUser && isCloseFriend) {
                        if (one.sharewith === "friends") {
                            filteredStoryList.push(storyWithFlags);
                        }
                    } else if (!isHiddenForCurrentUser) {
                        if (one.sharewith === "public" || (isCloseFriend && one.sharewith === "friends")) {
                            filteredStoryList.push(storyWithFlags);
                        }
                    }
                }

                if (filteredStoryList.length > 0) {
                    const filteredStoryObj = {
                        info: onestory.info,
                        story: filteredStoryList.sort((a, b) => new Date(a.datex) - new Date(b.datex)),
                    };

                    if (onestory.info._id.toString() === req.user._id.toString()) {
                        mystory.push(filteredStoryObj);
                    } else if (myfollowing.includes(onestory.info._id.toString())) {
                        myfollowerstory.push(filteredStoryObj);
                    } else {
                        otherstory.push(filteredStoryObj);
                    }
                }
            }

            res.send({ mystory, allinonestory: [...myfollowerstory, ...otherstory] });

        } catch (err) {
            console.error("Error in route /fetchStory:", err);
            return res.status(500).send({ message: "Internal Server Error", color: "red" });
        }
    },
    seenmystory: async (req, res) => {
        try {
            const { userid, storyid } = req.body;

            const user = await UserInfo.findOne({ info: userid, "story._id": storyid });

            if (!user) {
                return res.status(404).send({ message: "Story not found", color: "red" });
            }

            const story = user.story.find(s => s._id.toString() === storyid);

            if (!story) {
                return res.status(404).send({ message: "Story not found", color: "red" });
            }

            const alreadySeen = story.seen.some(s => s.user.toString() === req.user._id.toString());

            if (alreadySeen) {
                return res.send({ message: "Already seen", color: "yellow" });
            }


            await UserInfo.updateOne(
                { info: userid, "story._id": storyid },
                {
                    $addToSet: {
                        "story.$.seen": {
                            user: req.user._id,
                            like: false,
                            comment: { msg: "", datex: new Date() }
                        }
                    }
                }
            );

            res.send({ message: "Story marked as seen", color: "green" });

        } catch (error) {
            console.error("Error marking story as seen:", error);
            res.status(500).send({ message: "Internal Server Error", color: "red" });
        }
    },
    likemystory: async (req, res) => {
        try {
            const { userid, storyid } = req.body;
            console.log(userid, storyid);
            const likeStatus = req.params.what === "true";

            const updatedUser = await UserInfo.findOneAndUpdate(
                {
                    info: userid,
                    "story._id": storyid,
                },
                {
                    $set: { "story.$[storyElem].seen.$[seenElem].like": likeStatus }
                },
                {
                    arrayFilters: [
                        { "storyElem._id": storyid },
                        { "seenElem.user": req.user._id }
                    ],
                    new: true
                }
            );

            if (!updatedUser) {
                return res.status(400).send({ message: "Story or user not found", color: "red" });
            }

            res.send({ message: "Like status updated successfully", color: "green" });
        } catch (error) {
            console.error("Error updating story like:", error);
            res.status(500).send({ message: "Internal Server Error", color: "red" });
        }
    },
    addcmtinstory: async (req, res) => {
        try {
            const { userid, storyid, msg } = req.body;

            const updatedUser = await UserInfo.findOneAndUpdate(
                {
                    info: userid,
                    "story._id": storyid
                },
                {
                    $set: {
                        "story.$[storyElem].seen.$[seenElem].comment.msg": msg,
                        "story.$[storyElem].seen.$[seenElem].comment.datex": new Date()
                    }
                },
                {
                    arrayFilters: [
                        { "storyElem._id": storyid },
                        { "seenElem.user": req.user._id }
                    ],
                    new: true
                }
            );

            if (!updatedUser) {
                return res.status(400).send({ message: "Story or user not found", color: "red" });
            }
            if (msg === "") {
                return res.send({ message: "Comment removed", color: "green" });
            }

            res.send({ message: "Comment Sent", color: "green" });
        } catch (error) {
            console.error("Error updating story comment:", error);
            res.status(500).send({ message: "Internal Server Error", color: "red" });
        }
    },
    fetchcmtinstory: async (req, res) => {
        try {
            const { userid, storyid } = req.body;

            const userStory = await UserInfo.findOne({
                info: userid,
                "story._id": storyid
            }).populate("story.seen.user", "username pic");

            if (!userStory) {
                return res.status(404).send({ message: "Story not found", color: "red" });
            }

            let story = userStory.story.find(s => s._id.toString() === storyid);
            if (!story) {
                return res.status(404).send({ message: "Story not found", color: "red" });
            }

            // **Filter and sort comments in descending order by date**
            const filteredComments = story.seen
                .filter(s => s.comment && s.comment.msg && s.comment.msg.trim() !== "")
                .sort((a, b) => new Date(b.comment.datex) - new Date(a.comment.datex));

            res.send({ message: "Comments fetched successfully", color: "green", data: filteredComments });
        } catch (error) {
            console.error("Error fetching story comments:", error);
            res.status(500).send({ message: "Internal Server Error", color: "red" });
        }
    },
    fetchviewsinstory: async (req, res) => {
        try {
            const { userid, storyid } = req.body;

            const userStory = await UserInfo.findOne({
                info: userid,
                "story._id": storyid
            }).populate("story.seen.user", "username pic");

            if (!userStory) {
                return res.status(404).send({ message: "Story not found", color: "red" });
            }

            let story = userStory.story.find(s => s._id.toString() === storyid);
            if (!story) {
                return res.status(404).send({ message: "Story not found", color: "red" });
            }

            res.send({ message: "views fetched successfully", color: "green", data: story.seen });
        } catch (error) {
            console.error("Error fetching story comments:", error);
            res.status(500).send({ message: "Internal Server Error", color: "red" });
        }
    },
    deletestory: async (req, res) => {
        try {
            const { userid, storyid } = req.body;

            const userStory = await UserInfo.findOne({ info: userid, "story._id": storyid });
            if (!userStory) {
                return res.status(404).send({ message: "Story not found", color: "red" });
            }

            let story = userStory.story.find(s => s._id.toString() === storyid);
            if (!story) {
                return res.status(404).send({ message: "Story not found", color: "red" });
            }


            if (story.content.filename) {
                await removeimage(story.content.filename);
            }


            await UserInfo.findOneAndUpdate(
                { info: userid },
                { $pull: { story: { _id: storyid } } },
                { new: true }
            );

            res.send({ message: "Story deleted", color: "green" });
        } catch (error) {
            console.error("Error deleting story:", error);
            res.status(500).send({ message: "Internal Server Error", color: "red" });
        }
    }
}
