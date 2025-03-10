const User = require("../schema/newUserSchema.js");

module.exports = {
    searchusrmforgot: async (req, res) => {
        const { searchby } = req.params;
        const { username, email, mobile } = req.body.info
        let myValue
        if (searchby === "username" && username !== "") {
            myValue = username
        } else if (searchby === "email" && email !== "") {
            myValue = email
        } else if (searchby === "mobile" && mobile !== "") {
            myValue = mobile
        } else {
            res.send({ color: "red", message: "Invalid request not acceptable." })
            return
        }

        try {

            const isuser = await User.find({ [searchby]: { $regex: myValue, $options: "i" } }).select("pic , username  email , mobile")

            if (isuser.length === 0) {
                return res.send({ message: "User not found", color: "red" });
            }
            res.send(isuser)



        } catch (error) {
            console.error("Error updating notification:", error);
            res.status(500).send({
                message: "Server-side error.",
                color: "red",
            });
        }
    }, forgotpassword: async (req, res) => {
        try {
            const { newpass, newpass2, _id } = req.body;


            if (!newpass || !newpass2) {
                return res.status(400).send({ color: "red", message: "All fields are required." });
            }

            if (newpass !== newpass2) {
                return res.status(400).send({ color: "red", message: "Passwords do not match." });
            }

            if (newpass.length < 6) {
                return res.status(400).send({ color: "red", message: "Password must be at least 6 characters long." });
            }

            const user = await User.findById(_id);
            if (!user) {
                return res.status(404).send({ color: "red", message: "User not found." });
            }

            user.setPassword(newpass, async (err) => {
                if (err) {
                    console.error("Error setting password:", err);
                    return res.status(500).send({ color: "red", message: "Failed to change password." });
                }

                await user.save();


                req.logIn(user, (err) => {
                    if (err) {
                        console.error("Login error:", err);
                        return res.status(500).send({ message: "Login failed", color: "red" });
                    }
                    res.status(200).send({ color: "green", message: "Password changed successfully." });
                });
            });
        } catch (error) {
            console.error("Error during password change:", error);
            res.status(500).send({ color: "red", message: "An error occurred." });
        }
    }
}