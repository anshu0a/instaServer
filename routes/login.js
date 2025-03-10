const passport = require("passport")

module.exports = {
    loginUser: (req, res, next) => {

        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return res.send({ message: "Internal server error", color: "red" });
            }
            if (!user) {
                return res.send({ message: info?.message || "Invalid credentials", color: "red" });
            }
            req.logIn(user, (err) => {
                if (err) {
                    return res.send({ message: "Login failed", color: "red" });
                }
                return res.send({ message: "Login successful", color: "green", pic: user.pic.path });

            });
        })(req, res, next);
    },

    askUserinfo: async (req, res) => {
        try {
            if (req.user) {
                res.send(req.user);
            } else {
                res.json();
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
            res.json();
        }
    },
}
