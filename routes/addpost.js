

const postData = require("../schema/postData.js");
const User = require("../schema/newUserSchema.js");
const UserInfo = require("../schema/UserInfoSchema.js");
const { removeimage } = require("../cloudconfig.js")

module.exports = {
    allPost: async (req, res) => {
        try {
            const userInfo = {
                _id: req.user._id,
                username: req.user.username,
                pic: req.user.pic?.path || '',
            };
            let updatedPosts = [];

            let user = await UserInfo.findOneAndUpdate(
                { info: req.user._id },
                {},
                { new: true, upsert: true }
            ).select('saved');

            const posts = await postData.find({ archieve: false }) 
                .populate([
                    { path: 'user', select: 'username pic.path _id' },
                    { path: 'likes', select: 'username pic.path _id' },
                    { path: 'comment.info', select: 'username pic.path _id' },
                    { path: 'comment.reply.info', select: 'username pic.path _id' }
                ])
                .sort({ posttime: -1 });


            if (!posts.length) {
                return res.send({ message: 'No posts found.', color: 'red', posts: updatedPosts, user: userInfo, });
            }



            updatedPosts = posts.map(post => ({
                ...post.toObject(),
                isSave: user?.saved?.some(saved => saved.post.equals(post._id) && saved.type === "post")
            }));

            res.status(200).send({
                posts: updatedPosts,
                user: userInfo,
            });

        } catch (error) {
            console.error('Error fetching posts:', error);
            res.send({ message: 'Internal server error.', color: 'red' });
        }
    },
    onePost: async (req, res) => {

        try {
            const user = await UserInfo.findOne({ info: req.user._id }).select('saved');
            if (!user) {
                return res.status(404).send({ message: 'User not found.', color: 'red' });
            }

            const post = await postData.findById(req.params.postid)
                .populate({ path: 'user', select: 'fname username pic.path _id' })
                .populate({ path: 'comment.info', select: 'username pic.path _id' })
                .populate({ path: 'comment.reply.info', select: 'username pic.path _id' });
            if (post) {
                const updatedPosts = {
                    ...post.toObject(),
                    isSave: user?.saved.some(saved => saved.post.toString() === post._id.toString() && saved.type === "post")

                };
                res.send(updatedPosts)
            } else {
                res.send({ message: "post not found", color: "red" })
            }

        } catch (error) {
            res.send({
                message: "Internal server error.",
                color: "red",
            });
        }


    },
    savePost: async (req, res) => {
        const { postid } = req.params;
        try {
            const user = await UserInfo.findOne({ info: req.user._id });
            if (user) {
                if (user?.saved.some(saved => saved.post.toString() === postid.toString() && saved.type === "post")) {
                    user.saved.pull({ type: "post", post: postid })
                    await user.save();
                    return res.send({ message: "Post unsaved", color: "green" });

                } else {
                    user.saved.push({ type: "post", post: postid })
                    await user.save();
                    return res.send({ message: "Post saved", color: "green" });
                }
            }
        } catch (e) {
            console.log(e)
            return res.send({ message: "Serve-side error", color: "red" })

        }
    },
    deletepost: async (req, res) => {
        try {
            const { postid } = req.body;

            if (!postid) {
                return res.send({ message: "Post ID is required", color: "red" });
            }

            const mypost = await postData.findById(postid);
            if (!mypost) {
                return res.send({ message: "Post not found", color: "red" });
            }

            if (mypost.postimg && mypost.postimg.filename) {
                await removeimage(mypost.postimg.filename);
            }

            await mypost.deleteOne();

            const user = await User.findById(req.user._id);
            if (user) {
                await user.post.pull(postid);
                await user.save();
            }

            await UserInfo.updateMany(
                { "saved.post": postid },
                { $pull: { saved: { post: postid } } }
            );

            res.json({ message: "Post deleted successfully.", color: "green" });
        } catch (error) {
            console.error("Error deleting post:", error);
            res.send({ message: "Internal Server Error", color: "red" });
        }
    },
    editbio: async (req, res) => {
        try {
            const { description } = req.body;
            const { postid, type } = req.params;
            let post = null;

            if (type === "arc") {
                post = await postData.findByIdAndUpdate(postid, { archieve: true }, { new: true });
            } else if (type === "notarc") {
                post = await postData.findByIdAndUpdate(postid, { archieve: false }, { new: true });
            } else if (type === "bio") {
                post = await postData.findByIdAndUpdate(postid, { description, edit: true }, { new: true });
            } else {
                return res.status(400).json({ message: "Invalid type.", color: "red" });
            }

            if (!post) {
                return res.status(404).json({ message: "Post not found.", color: "red" });
            }

            const messages = {
                arc: "Post archived.",
                notarc: "Post unarchived.",
                bio: "Post edited."
            };

            return res.status(200).json({ message: messages[type], color: "green" });

        } catch (error) {
            console.error("Error updating post:", error);
            return res.status(500).json({ message: "Internal Server Error", color: "red" });
        }
    }

}