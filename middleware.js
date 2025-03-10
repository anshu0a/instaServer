module.exports.isLogin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.send({
            message: 'Login required.',
            color: 'red',
        });
    }
    next();
};
