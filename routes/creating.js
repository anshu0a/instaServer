const user = require("../schema/newUserSchema.js");
const UserInfo = require("../schema/UserInfoSchema.js");

module.exports = {
    checkUsername: async (req, res) => {

        try {
            const data = await user.find({ username: req.body.username });
            if (data.length > 0) {
                return res.status(200).send({ msg: "no", user: data[0] });
            }
            return res.status(200).send({ msg: "ok" });
        } catch (error) {
            console.error("Error checking username:", error);
            return res.status(500).send({ message: "An error occurred", color: "red" });
        }

    },
    newUser: async (req, res) => {
        try {

            let profilePicPath = req.body.gender === "female" ? "/svg/userf.jpg" : "/svg/userm.jpg";


            let dataOfUser = new user({
                fname: req.body.fname,
                lname: req.body.lname,
                email: req.body.email,
                mobile: req.body.mobile,
                username: req.body.user,
                gender: { value: req.body.gender },
                birthdate: { datex: req.body.birthdate },
                pic: { path: profilePicPath },
            });


            const registeruser = await user.register(dataOfUser, req.body.pass);

            const newUserInfo = new UserInfo({
                info: registeruser._id,
                Notifications: [
                    {
                        sendertype: "team",
                        sender: undefined,
                        msg: "Setup your profile for a better experience",
                        url: `/EditProfile/${registeruser.username}`,
                    },
                ],
            });


            await newUserInfo.save();

            return res.send({
                message: `${registeruser.fname}'s account created!`,
                color: "green",
            });

        } catch (error) {
            console.error(error);

            if (error.name === 'UserExistsError') {
                return res.send({
                    message: "Username already exists.",
                    color: "red"
                });
            }

            return res.send({
                message: "An error occurred during registration.",
                color: "red"
            });
        }
    },

    userExist: async (req, res) => {
        try {
            const data = await user.find({ username: req.params.username });
            if (data.length > 0) {
                return res.send({ exists: true });
            } else {
                return res.send({ exists: false });
            }
        } catch (error) {
            console.error('Error during search:', error);
            return res.send({ error: "Internal server error" });
        }
    },
    logoutUser: (req, res) => {
        try {
            req.logout(function (err) {
                if (err) {
                    return res.send({
                        message: "Logout failed. Please try again.",
                        color: "red"
                    });
                }
                req.session.destroy(() => {
                    res.clearCookie("connect.sid", { path: "/" });

                    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");

                    res.send({
                        message: "Logged out.",
                        color: "green",
                    });
                });
            });
        } catch (error) {
            console.error(error);
            return res.send({
                message: "An error occurred during logout.",
                color: "red"
            });
        }
    },


}