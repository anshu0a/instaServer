
const User = require("../schema/newUserSchema.js");


module.exports = {
    fetchlink: async (req, res) => {
        try {

            const add = await User.findById(req.user._id).select("links");
            if (add) {
                const reversedLinks = add.links.allLinks.reverse();
                res.send({ links: reversedLinks, show: add.links.show })

            } else {
                res.send({ color: "red", message: "User not found." });
            }
        } catch (error) {
            console.error('Error during fetch link:', error);
            return res.send({ color: "red", message: "Failed to fetch link" });
        }
    },
    deletelink: async (req, res) => {
        try {
            const { id } = req.params;
            const add = await User.findById(req.user._id).select("links");
            if (add) {
                add.links.allLinks.pull({ _id: id });
                await add.save();
                res.send({ message: "Link deleted successfully.", color: "green" });
            } else {
                res.send({ color: "red", message: "User not found." });
            }
        } catch (error) {
            console.error('Error during fetch link:', error);
            return res.send({ color: "red", message: "Failed to fetch link" });
        }
    },
    editlink:async (req, res) => {
        try {
            const { name, link } = req.body;
            const { id } = req.params
    
            const add = await User.findById(req.user._id);
            if (add) {
                await add.links.allLinks.pull({ _id: id });
                await add.links.allLinks.push({ name: name, link: link });
                const alllink = await add.save();
                res.send({ message: "Link edited successfully.", color: "green", alllinks: alllink.links.allLinks.reverse() });
            } else {
                res.send({ color: "red", message: "User not found." });
            }
        } catch (error) {
            console.error('Error during edit link:', error);
            return res.send({ color: "red", message: "Failed to edit link" });
        }
    },
    showlinks:async (req, res) => {
        try {
            const { show } = req.body;
    
            const add = await User.findByIdAndUpdate(req.user._id, { "links.show": show }, { new: true });
    
            if (add) {
    
                if (show) {
                    res.send({ message: "Link successfully displayed.", color: "green" });
                } else {
                    res.send({ message: "Link successfully hide.", color: "green" });
                }
            } else {
                res.send({ color: "red", message: "User not found." });
            }
        } catch (error) {
            console.error('Error during edit link:', error);
            return res.send({ color: "red", message: "Server-side error" });
        }
    }

}
