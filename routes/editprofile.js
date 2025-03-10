
const User = require("../schema/newUserSchema.js");
const UserInfo = require("../schema/UserInfoSchema.js");

const { removeimage } = require("../cloudconfig.js")


module.exports = {
    userInfo: async (req, res) => {
        try {
            const data = await User.find({ username: req.params.user })
                .populate({
                    path: 'post',
                    select: 'postimg.path archieve likes _id'
                })
                .select('pic username birthdate fname lname gender bio badge post links relationship');


            if (data.length === 0) {
                return res.send({
                    message: 'User not found',
                    color: "red"
                });

            }

            const userInfo = {
                username: req.user.username,
                pic: req.user.pic?.path || '',
                _id: req.user._id
            };

            res.status(200).send({
                data: data,
                user: userInfo,
            });

        } catch (error) {
            console.error('Error during search:', error);
            return res.status(500).send({
                message: "Internal  error.",
                color: "red"
            });
        }
    },
    uploadPic: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ color: "red", message: "No file uploaded" });
            }


            const data1 = await User.findById(req.user._id);
            if (!data1) {
                return res.status(404).json({ color: "red", message: "User not found" });
            }


            if (data1.pic?.filename && data1.pic.filename !== "no") {
                try {
                    await removeimage(data1.pic.filename);
                } catch (error) {
                    console, log(error)
                    return res.status(500).json({
                        color: "red",
                        message: "Failed to remove the old image"
                    });
                }
            }


            await User.findByIdAndUpdate(
                req.user._id,
                { $set: { pic: { path: req.file.path, filename: req.file.filename } } }
            );


            res.json({ color: "green", message: "Picture updated successfully" });
        } catch (error) {
            console.error("Error during image update:", error);
            res.status(500).json({ color: "red", message: "Failed to upload image" });
        }
    },
    updateFname: async (req, res) => {
        try {
            const { username, fname, lname, bio } = req.body;
            console.log(req.body)


            if (!username || !fname || !lname || !bio || username.trim() === "" || fname.trim() === "" || lname.trim() === "" || bio.trim() === "") {
                return res.status(400).json({ color: "red", message: "Username, first name, and last name are required" });
            }

            const result = await User.findByIdAndUpdate(
                req.user._id,
                { $set: { username, fname, lname, bio } }
            );


            if (result.modifiedCount === 0) {
                return res.status(400).json({ color: "red", message: "No changes were made" });
            }

            res.json({ color: "green", message: "Name updated successfully" });
        } catch (error) {
            console.error('Error during name update:', error);
            res.status(500).json({ color: "red", message: "Failed to update name" });
        }
    },
    chgGenderBirth: async (req, res) => {
        try {
            const { birthdate, gender } = req.body;
            console.log(gender)

            if (!birthdate || !birthdate.datex || !birthdate.img) {
                return res.status(400).json({ color: "red", message: "Birthdate data is missing or incomplete" });
            }

            if (!gender) {
                return res.status(400).json({ color: "red", message: "Gender data is missing or incomplete" });
            }


            const result = await User.findByIdAndUpdate(
                req.user._id,
                {
                    $set: {
                        birthdate: { datex: birthdate.datex, img: birthdate.img },
                        gender: { value: gender.value, show: gender.show }
                    }
                }
            );


            if (result.modifiedCount === 0) {
                return res.status(400).json({ color: "red", message: "No changes were made" });
            }


            res.json({ color: "green", message: "updated successfully" });
        } catch (error) {
            console.error('Error during update:', error);
            res.status(500).json({ color: "red", message: "Failed to update " });
        }
    },
    searchBadge: async (req, res) => {
        try {
            const query = { "badge.msg": { $regex: req.params.name, $options: 'i' } };
            const data = await User.aggregate([
                { $match: query },
                { $group: { _id: "$badge.msg", badge: { $first: "$badge" }, _idRef: { $first: "$_id" } } }
            ]);
            res.send(data)

        } catch (error) {
            res.send({ message: "-side error", color: "red" })

        }
    },
    newBadge: async (req, res) => {
        try {
            await User.findByIdAndUpdate(req.user._id, {
                $set: {
                    badge: {
                        msg: req.body.msg,
                        color: req.body.color,
                        show: req.body.show
                    }
                }
            });
            res.json({ color: "green", message: "Badge updated successfully" });
        } catch (error) {
            console.error('Error during badge update:', error);
            res.status(500).json({ color: "red", message: "Failed to update badge" });
        }
    },
    sendSaved: async (req, res) => {
        try {
            const user = await UserInfo.findOne({ info: req.user._id }).select('saved').populate({ path: 'saved.post', select: 'postimg' });

            if (!user) {
                return res.status(404).send({ message: 'User not found.', color: 'red' });
            }
            res.send(user.saved)

        } catch (er) {
            res.send({ message: er.message, color: "red" })
        }
    },
    changemypassword: async (req, res) => {
        try {
            const { oldpass, newpass, newpass2 } = req.body.text;

            if (!oldpass || !newpass || !newpass2) {
                return res.send({ color: "red", message: "All fields are required" });
            }


            if (newpass !== newpass2) {
                return res.send({ color: "red", name: "newpass2", message: "New passwords do not match" });
            }

            const user = await User.findById(req.user._id);

            if (!user) {
                return res.json({ color: "red", message: "User not found" });
            }


            user.changePassword(oldpass, newpass, (err) => {
                if (err) {
                    if (err.name === "IncorrectPasswordError") {
                        return res.json({ color: "red", name: "oldpass", message: "Incorrect old password" });
                    } else {
                        console.error("Error changing password:", err);
                        return res.json({ color: "red", message: "Something went wrong!" });
                    }
                }


                res.json({ color: "green", message: "Your password has been changed." });
            });
        } catch (error) {
            console.error("Error during password change:", error);
            res.send({ color: "red", message: "Failed to change password." });
        }
    },
    chnagemyEmail: async (req, res) => {
        const { emailid } = req.body;

        try {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailid)) {
                return res.status(400).send({ color: "red", message: "Invalid email format" });
            }

            const iam = await User.findByIdAndUpdate(req.user._id, { email: emailid }, { new: true });

            if (!iam) {
                return res.status(404).send({ color: "red", message: "User not found" });
            }

            res.status(200).send({ color: "green", message: "Email id updated successfully" });
        } catch (error) {
            console.error("Error updating email id:", error);
            res.status(500).send({ color: "red", message: error.message || "Something went wrong" });
        }
    }, changemyNumber: async (req, res) => {
        const { mobileno } = req.body;

        try {
            const iam = await User.findByIdAndUpdate(req.user._id, { mobile: mobileno }, { new: true });

            if (!iam) {
                return res.status(404).send({ color: "red", message: "User not found" });
            }

            res.status(200).send({ color: "green", message: "Mobile number updated successfully" });
        } catch (error) {
            console.error("Error updating mobile number:", error);
            res.status(500).send({ color: "red", message: error.message || "Something went wrong" });
        }

    }


}