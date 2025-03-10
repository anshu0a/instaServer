const express = require("express");
const app = express();
const path = require("path");
const mongo = require("mongoose");
require('dotenv').config();
const MongoStore = require('connect-mongo')

const multer = require('multer');
const { storage } = require("./cloudconfig.js")
const upload = multer({ storage });
const { removeimage } = require("./cloudconfig.js")

const cors = require("cors");

const session = require("express-session");
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy;
const bodyParser = require("body-parser");

const User = require("./schema/newUserSchema.js");
const UserInfo = require("./schema/UserInfoSchema.js");
const mainData = require("./schema/mainData.js");
const postData = require("./schema/postData.js");
const msgData = require("./schema/msgData.js");
const followData = require("./schema/followData.js");


const { isLogin } = require('./middleware.js');
const { msgList, oneChat } = require("./routes/msg.js")
const { sendMail } = require("./routes/mailoptions.js")
const { loginUser, askUserinfo } = require("./routes/login.js")
const { checkUsername, newUser, userExist, logoutUser } = require("./routes/creating.js")
const { serachHistory, deleteHistory, searchUsername, addHistory } = require("./routes/search.js")
const { userInfo, uploadPic, updateFname, searchBadge, chgGenderBirth, newBadge, sendSaved, changemypassword, chnagemyEmail, changemyNumber, } = require("./routes/editprofile.js")
const { feedbackSend, edtrelationship, addhelp, fetchhelp, deleteorreadhelp, fetchsuggest, deleteorreadsuggest, addreport, fetcreport, deleteorreadreport } = require("./routes/feedback.js")
const { allPost, onePost, savePost, deletepost, editbio } = require("./routes/addpost.js")
const { allBadge, searchFilter } = require("./routes/filter.js")
const { allNotification, deleteNotifications, seenNotification } = require("./routes/notification.js")
const { followStatus, followerFollowing } = require("./routes/follow.js");
const { searchusrmforgot, forgotpassword } = require("./routes/forgot.js");
const { fetchlink, deletelink, editlink, showlinks } = require("./routes/link.js");
const { fetchclose, addclosefrnd, hidelist, addhidelist, addstory, fetchStory, seenmystory, likemystory, addcmtinstory, fetchcmtinstory, fetchviewsinstory, deletestory } = require("./routes/story.js");

//____________________________________________________________________________soket ____________________________________________

const onlineUser = [];
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["https://insta-b9i6.onrender.com", "http://localhost:5173", "https://insta-theta-blond.vercel.app"],
        methods: ["GET", "POST"],
    },
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('authenticate', (userId) => {
        if (userId && !onlineUser.includes(userId)) {
            onlineUser.push(userId);
            socket.userId = userId;
            console.log('User authenticated:', userId);
            io.emit('onlineUsers', onlineUser);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        if (socket.userId) {
            const index = onlineUser.indexOf(socket.userId);
            if (index !== -1) {
                onlineUser.splice(index, 1);
                io.emit('onlineUsers', onlineUser);
            }
        }
    });


    socket.on('reconnect', () => {
        if (socket.userId && !onlineUser.includes(socket.userId)) {
            onlineUser.push(socket.userId);
            io.emit('onlineUsers', onlineUser);
        }
    });
});


//____________________________________________________________________________________________________________

const monurl = process.env.ATLAS;
const main = async function () {
    await mongo.connect(monurl);
};
main()
    .then(() => console.log("Mongoose connected..."))
    .catch((er) => console.log("Mongoose error: " + er));

const cstore = MongoStore.create({
    mongoUrl: monurl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});
cstore.on("error", (err) => {
    console.log("ErroR iN MONGO sTORE : ", err);
});

//_______________________________________________________________________________________________________________________


const corsOptions = {
    origin: [
        "https://insta-b9i6.onrender.com",
        "http://localhost:5173",
        "https://insta-seven-gamma.vercel.app"
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.set("trust proxy", 1);


const sessionOptions = {
    store: MongoStore.create({
        mongoUrl: process.env.ATLAS, // Your MongoDB URI
        crypto: { secret: process.env.SECRET },
        touchAfter: 24 * 3600, // Reduce session updates
    }),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true, // HTTPS required
        httpOnly: true,
        sameSite: "none", // Required for cross-origin requests
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
};
//__________________________________________________________________________________________________________________

app.use(express.json());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session(sessionOptions));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: err.message, color: "red" });
});


//_________________________________________________________________________________________________________

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// ______________________________________________________middleware _____________________________________________-


//_______________________________________________________________login _______________________________-
app.post("/checkUser", loginUser);
app.post("/askforuserid", askUserinfo);
//_______________________________________________________________logout _______________________________-
app.post("/logoutuser", logoutUser);
//_______________________________________________________________send otp on gmail__________________________
app.post("/otp/:type", sendMail);
//_______________________________________________________________creating account ___________________________
app.post("/checkUsername", checkUsername)
app.post("/newUser", newUser);
//_______________________________________________________________username exist or not______________________
app.post('/usernameExist/:username', userExist);
//_______________________________________________________________search_forgot password______________________
app.post("/forgot/:searchby", searchusrmforgot)
//_______________________________________________________________forgot password______________________
app.post("/changepassword", forgotpassword);
//_______________________________________________________________Change mobile no______________________
app.post("/changemymobile", isLogin, changemyNumber);
//_______________________________________________________________Change email id______________________ 
app.post("/changemyemail", isLogin, chnagemyEmail);
//_______________________________________________________________Searching for username______________________
app.post('/search/:username', searchUsername);
//_______________________________________________________________Add history_____________________
app.post("/addHistory/:username", isLogin, addHistory);
//_______________________________________________________________search history_____________________
app.post("/searchHistory", isLogin, serachHistory);
//_______________________________________________________________delete history_____________________
app.post("/deleteHistory/:username", isLogin, deleteHistory);
//_______________________________________________________________update data send_________________________________
app.post('/updateData/:user', isLogin, userInfo);
//_______________________________________________________________saved post send_________________________________
app.post('/savedlao', isLogin, sendSaved);
//_______________________________________________________________upload pic________________________
app.post("/updatePic", isLogin, upload.single("file"), uploadPic);
//_______________________________________________________________update name_______________________________________________
app.post("/updateName", isLogin, updateFname);
//_______________________________________________________________changr password__________________________________________________
app.post("/changemypassword", isLogin, changemypassword);
//_______________________________________________________________change username___________________________________________________
app.post("/changemyusername", isLogin, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username) {
            return res.send({ color: "red", message: "Username is required" });
        }
        if (!password) {
            return res.send({ color: "red", message: "Password is required" });
        }

        req.user.authenticate(password, async (err, user, info) => {
            if (err || !user) {
                return res.send({ color: "red", message: "Wrong Password" });
            }
            if (username.length < 4 || username.length > 20) {
                return res.send({ color: "red", message: "Username must be between 4 and 20 characters" });
            }

            const result = await User.findByIdAndUpdate(
                req.user._id,
                { $set: { username, lastUsernameUpdate: { datex: Date.now(), is: true } } },
                { new: true }
            );

            if (!result) {
                return res.send({ color: "red", message: "User not found or no changes made" });
            }
            req.user.username = result.username;

            req.logIn(result, async (err) => {
                console.log("Logging in user...");
                if (err) {
                    console.error("Login error:", err);
                    return res.send({ message: "Login failed", color: "red" });
                }

                const myFollowers = await followData.find({
                    $or: [{ user1: req.user._id, back: true }, { user2: req.user._id }]
                });


                for (const oneFollower of myFollowers) {
                    const receiver = oneFollower.user1.equals(req.user._id) ? oneFollower.user2 : oneFollower.user1;
                    const isUser = await UserInfo.findOne({ info: receiver });

                    if (isUser) {
                        const genderPronoun = req.user.gender.type === "female" ? "her" : "his";

                        isUser.Notifications.push({
                            sender: req.user._id,
                            sendertype: "follow",
                            msg: `${req.user.fname} changed ${genderPronoun} username to ${username}`
                        });

                        const data = await isUser.save();
                        const oneNotification = data.Notifications[data.Notifications.length - 1];
                        oneNotification.sender = req.user;

                        io.emit(`noti${receiver}`, oneNotification);
                    }
                }

                return res.send({ color: "green", message: "Username updated successfully" });
            });
        });
    } catch (error) {
        console.error('Error during name update:', error);
        return res.send({ color: "red", message: "Failed to update username" });
    }
});



//______________________________________________________________Add link_____________________
app.post("/addlink", isLogin, async (req, res) => {
    try {
        const { name, link } = req.body;

        if (name === "" || link === "") {
            return res.send({ color: "red", message: "Missing field not valid." });
        }

        const add = await User.findById(req.user._id);
        if (add) {
            add.links.allLinks.push({ name, link });
            const newprofile = await add.save();

            const myFollowers = await followData.find({
                $or: [{ user1: req.user._id, back: true }, { user2: req.user._id }]
            });


            for (const oneFollower of myFollowers) {
                const receiver = oneFollower.user1.equals(req.user._id) ? oneFollower.user2 : oneFollower.user1;
                const isUser = await UserInfo.findOne({ info: receiver });

                if (isUser) {
                    isUser.Notifications = isUser.Notifications.filter(
                        (onenoti) => !onenoti.msg.includes("added a new link:")
                    );

                    isUser.Notifications.push({
                        sender: req.user._id,
                        sendertype: "follow",
                        msg: `${req.user.fname} added a new link: ${name}`,
                    });

                    const data = await isUser.save();

                    const oneNotification = data.Notifications[data.Notifications.length - 1];
                    oneNotification.sender = req.user;

                    io.emit(`noti${receiver}`, oneNotification);
                }

            }

            res.send({ color: "green", message: "Links added successfully.", alllinks: newprofile.links.allLinks.reverse(), show: newprofile.links.show });
        } else {
            res.send({ color: "red", message: "User not found." });
        }
    } catch (error) {
        console.error('Error during name update:', error);
        return res.send({ color: "red", message: "Failed to add link" });
    }
});

app.post("/laolink", isLogin, fetchlink);
app.post("/deletelink/:id", isLogin, deletelink);
app.post("/editlink/:id", isLogin, editlink);
app.post("/addshowlink", isLogin, showlinks);
//_____________________________________________________________update birthday gender_____________________
app.post("/changeGenderBday", isLogin, chgGenderBirth);
//_____________________________________________________________Searching for  badge______________________
app.post('/badge/:name', searchBadge);
//_____________________________________________________________update new badge______________________
app.post('/changeBadge', isLogin, newBadge);
//_____________________________________________________________feedback_____________________
app.post('/suggestion', isLogin, feedbackSend);
//____________________________________________________________ fetch data for post ____________________
app.post('/postdo', isLogin, allPost);
// ____________________________________________________________fetch one post _____________________________________
app.post("/laocmt/:postid", isLogin, onePost);
// ____________________________________________________________save unsave one post _____________________________________
app.post("/savepost/:postid", isLogin, savePost);
//_____________________________________________________________add post ______________________________

app.post('/postkro', isLogin, upload.single('file'), async (req, res) => {
    const userId = req.user._id;
    try {
        if (!req.file) {
            return res.status(400).send({
                message: 'No file uploaded.',
                color: 'red',
            });
        }
        const { loc, des } = req.body;

        const newPost = new postData({
            user: userId,
            postimg: {
                path: req.file.path,
                filename: req.file.filename
            },
            location: loc || '',
            description: des || ''
        });

        const savedPost = await newPost.save();


        await User.findByIdAndUpdate(userId, {
            $push: { post: savedPost._id }
        });

        res.status(200).send({
            message: 'Post uploaded successfully!',
            color: 'green',
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: 'An error occurred during upload.',
            color: 'red',
        });
    }
});

//________________________________________________ like a post______________________________________
app.post("/dolike/:postid", isLogin, async (req, res) => {
    try {
        const post = await postData.findById(req.params.postid);
        if (!post) {
            return res.status(404).json({
                message: 'Post not found',
                color: 'red',
            });
        }

        const userId = req.user._id.toString();
        const hasLiked = post.likes.some((like) => like.toString() === userId);

        if (hasLiked) {
            post.likes.pull(userId);
            await post.save();

            return res.send({
                message: 'Post unliked successfully',
                color: "green",
            });
        } else {
            post.likes.push(userId);
            await post.save();

            const user = await UserInfo.findOne({ info: post.user });
            let preuser = "";

            if (user) {
                user.Notifications = user.Notifications.filter(notification => {
                    if (notification.msg.includes("liked your post") &&
                        notification.postid.toString() === post._id.toString()) {
                        const parts = notification.msg.split(" ");
                        if (parts.length > 0) {
                            const prevName = parts[0];
                            if (prevName !== req.user.fname) {
                                preuser = ` and ${prevName}`;
                            }
                        }
                    }

                    return !(notification.msg.includes("liked your post") &&
                        notification.postid.toString() === post._id.toString());
                });

                user.Notifications.push({
                    sendertype: "user",
                    sender: req.user._id,
                    postid: post._id,
                    msg: `${req.user.fname}${preuser} liked your post`,
                });

                const data = await user.save();
                let onenoti = data.Notifications[data.Notifications.length - 1]
                onenoti.sender = req.user;
                io.emit("noti" + post.user, onenoti)
            }

            return res.send({
                message: 'Post liked successfully',
                color: "green",
            });
        }
    } catch (error) {
        console.error('Error processing like/unlike:', error);
        res.send({
            message: 'Internal server error while liking/unliking the post',
            error: error.message,
            color: 'red',
        });
    }
});
// ______________________________________________________________comment a post _and reply___________________________________
app.post("/docmt/:postid", isLogin, async (req, res) => {
    try {
        const post = await postData.findById(req.params.postid).populate('user comment.info');

        if (!post) {
            return res.status(404).send({
                message: "Post not found",
                color: "red",
            });
        }

        if (req.body.rpid) {
            const comment = post.comment.find(cmt => cmt._id.toString() === req.body.rpid);
            if (!comment) {
                return res.status(404).send({
                    message: "Comment not found",
                    color: "red",
                });
            }

            comment.reply = comment.reply || [];
            comment.reply.push({
                info: req.user._id,
                dtl: req.body.comment,
            });

            await post.save();
            await addNotification(post.user._id, req.user, post._id, `${req.user.fname} replied to ${comment.info.fname} on your post`, req.user._id);
            await addNotification(comment.info._id, req.user, post._id, `${req.user.fname} replied to you on ${post.user.fname}'s post`, req.user._id);

            const mentions = req.body.comment.match(/@(\w+)/g);
            if (mentions) {
                for (let mentionText of mentions) {
                    const mentionUsername = mentionText.substring(1);
                    const mentionUser = await User.findOne({ username: mentionUsername }).select("fname _id");

                    if (mentionUser && comment.info._id.toString() !== mentionUser._id.toString()) {
                        await addNotification(mentionUser._id, req.user, post._id, `${req.user.fname} mentioned you in ${comment.info.fname}'s comment on ${post.user.fname}'s post`, req.user._id);
                    }
                }
            }

            return res.status(200).send({
                message: "Reply added successfully",
                color: "green",
            });

        } else {
            post.comment.push({
                info: req.user._id,
                dtl: req.body.comment,
            });

            await post.save();

            await addNotification(post.user._id, req.user, post._id, `${req.user.fname} commented on your post`, req.user._id);

            const mentions = req.body.comment.match(/@(\w+)/g);
            if (mentions) {
                for (let mentionText of mentions) {
                    const mentionUsername = mentionText.substring(1);
                    const mentionUser = await User.findOne({ username: mentionUsername }).select("fname _id");

                    if (mentionUser && post.user._id.toString() !== mentionUser._id.toString()) {
                        await addNotification(mentionUser._id, req.user, post._id, `${req.user.fname} mentioned you in their comment on ${post.user.fname}'s post`, req.user._id);
                    }
                }
            }

            return res.status(200).send({
                message: "Comment added successfully",
                color: "green",
            });
        }

    } catch (error) {
        console.error("Error in /docmt/:postid:", error);
        return res.status(500).send({
            message: "Internal server error while adding comment",
            color: "red",
        });
    }
});

async function addNotification(userId, sender, postId, message, myid) {
    try {

        const user = await UserInfo.findOne({ info: userId });

        if (user) {
            const notificationExists = user.Notifications.some(notification => {
                return (notification.sender ?
                    notification.sender.toString() === sender._id.toString() : true) &&
                    (notification.postid ?
                        notification.postid.toString() === postId.toString() : true) &&
                    notification.msg === message;
            });

            if (notificationExists) {
                user.Notifications.pull({
                    sendertype: "user",
                    sender: sender._id,
                    postid: postId,
                    msg: message,
                });
                await user.save();
            }
            user.Notifications.push({
                sendertype: "user",
                sender: sender._id,
                postid: postId,
                msg: message,

            });
            const data = await user.save();
            let onenoti = data.Notifications[data.Notifications.length - 1]
            onenoti.sender = myid;
            io.emit("noti" + userId, onenoti)
        }

    } catch (error) {
        console.error("Error adding notification:", error);
    }
}
//_________________________________________________________________delete post__________________________________________________________
app.post("/deletepost", isLogin, deletepost)
//_________________________________________________________________edit post__________________________________________________________
app.post("/editpostbio/:type/:postid", isLogin, editbio)
//_________________________________________________________________filter load__________________________________________________________
app.post('/fltrData/:nax', isLogin, allBadge);
//_________________________________________________________________search filter and send_______________________________________________
app.post('/applyFilter', isLogin, searchFilter);
//_________________________________________________________________msg list ______________________________________________________________
app.post('/konkon/:forwhat', isLogin, msgList);
//_________________________________________________________________one chat _______________________________________________________
app.post('/chatlao/:user2', isLogin, oneChat);
//_________________________________________________________________add msg ______________________________________________________
app.post("/bhezomsg", isLogin, upload.single('photo'), async (req, res) => {
    try {
        const { user2, msg } = req.body;
        let dt

        if (req.file) {
            const { path, filename } = req.file;

            dt = {
                sender: req.user._id,
                reciever: user2,
                msg: msg,
                photo: {
                    path: path,
                    filename: filename
                }
            }
        } else {
            dt = {
                sender: req.user._id,
                reciever: user2,
                msg: msg,
            }
        }

        const newmsg = new msgData(dt);
        const resst = await newmsg.save();
        const populatedChats = await msgData.populate(resst,
            {
                path: 'sender',
                model: "alluser",
                select: "fname username pic online"
            });

        io.emit(user2, populatedChats)
        res.send({ msg: "message send", color: "green" })
    } catch (e) {
        res.send({ msg: "server-side error", color: "red" })
    }
})

//_________________________________________________________fetch notifications ____________________________________________________________________
app.post("/laoNoti/:_id", isLogin, allNotification);
//_________________________________________________________delete notifications ____________________________________________________________________
app.post("/dealnoti/:notiid", isLogin, deleteNotifications)
//_________________________________________________________seen unseen notifications ____________________________________________________________________
app.post("/notif/:type/:notiid", isLogin, seenNotification)
//_________________________________________________________add Notification respond_________________________________

app.post("/addNoti/:_id", isLogin, async (req, res) => {
    try {
        const isuser = await UserInfo.findOne({ info: req.params._id });


        if (isuser) {

            const notificationExists = isuser.Notifications.some(notification => {
                return (notification.sender ?
                    notification.sender.toString() === req.user._id.toString() : true) &&
                    notification.sendertype === "respond"
            });
            if (notificationExists) {
                isuser.Notifications = isuser.Notifications.filter(notification =>
                    !(notification.sender?.toString() === req.user._id.toString() &&
                        notification.sendertype === "respond")
                );
            }

            isuser.Notifications.push({
                sender: req.user._id,
                sendertype: "respond",
                msg: req.user.fname + " respond you : ' " + req.body.msg + " '",
            });

            const data = await isuser.save();
            let onenoti = data.Notifications[data.Notifications.length - 1]
            onenoti.sender = req.user;
            io.emit("noti" + req.params._id, onenoti)
        }

        res.send({ message: "Response send.", color: "green" });
    } catch (error) {
        console.log(error);
        res.send({
            message: "An error occurred",
            color: "red",
        });
    }
});

//_________________________________________________________________________________list follower following _________________________________________________
app.post("/laofollow/:one", isLogin, followerFollowing);
//_________________________________________________________________________________fetch sts follow _________________________________________________
app.post("/kyafollow/:two", isLogin, followStatus);
//_________________________________________________________________________________follow unfollow ______________________________________
app.post("/followme/:two", isLogin, async (req, res) => {
    const { two } = req.params;
    const one = req.user._id;


    if (!two) {
        return res.json({ message: "Invalid user", color: "red" });
    }

    try {
        const user = await UserInfo.findOne({ info: two });
        const exist = await followData.findOne({
            $or: [{ user1: one, user2: two }, { user1: two, user2: one }]
        });

        if (exist) {
            if (exist.user1.toString() == one && exist.user2.toString() == two) {
                if (exist.back) {
                    await followData.updateOne(
                        { user1: one, user2: two },
                        { $set: { user1: two, user2: one, back: false, date1: exist.date2, date2: null } }
                    );
                    res.send("Follow back")
                } else {
                    await followData.deleteOne({ user1: one, user2: two });
                    res.send("Follow")
                }

                if (user) {
                    user.Notifications.pull({
                        sendertype: "follow",
                        sender: req.user._id,
                    });

                    if (user.isModified("Notifications")) {
                        await user.save();
                    }
                }
            } else {
                if (exist.back) {
                    await followData.updateOne(
                        { user1: two, user2: one },
                        { $set: { back: false, date2: null } }
                    );

                    if (user) {
                        user.Notifications.pull({
                            sendertype: "follow",
                            sender: req.user._id,
                        });

                        if (user.isModified("Notifications")) {
                            await user.save();
                        }
                    }
                    res.send("Follow back")

                } else {
                    await followData.updateOne(
                        { user1: two, user2: one },
                        { $set: { back: true, date2: Date.now() } }
                    );
                    if (user) {
                        user.Notifications.push({
                            sendertype: "follow",
                            sender: req.user._id,
                            msg: `${req.user.username} followed you back`,
                        });

                        if (user.isModified("Notifications")) {
                            const data = await user.save();
                            let onenoti = data.Notifications[data.Notifications.length - 1]
                            onenoti.sender = req.user;
                            io.emit("noti" + two, onenoti)
                        }
                    }
                    res.send("Unfollow")
                }
            }
        } else {
            const newFollow = new followData({ user1: one, user2: two, date1: Date.now() });
            await newFollow.save();

            if (user) {
                user.Notifications.push({
                    sendertype: "follow",
                    sender: req.user._id,
                    msg: `${req.user.username} started following you`,
                });

                if (user.isModified("Notifications")) {
                    const data = await user.save();
                    let onenoti = data.Notifications[data.Notifications.length - 1]
                    onenoti.sender = req.user;
                    io.emit("noti" + two, onenoti)
                }
            }
            res.send("Unfollow")
        }
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal Server Error", color: "red" });
    }
});

//________________________________________________________________________close frnd__________________________________
app.post("/closefrnd", isLogin, fetchclose);
//________________________________________________________________________add_close frnd__________________________________
app.post("/closebhezo", isLogin, addclosefrnd);
//________________________________________________________________________hide list______________________________________________________________
app.post("/hidelist", isLogin, hidelist)
//________________________________________________________________________add_hide hist__________________________________
app.post("/hidebhezo", isLogin, addhidelist);
//________________________________________________________________________fetch_story__________________________________
app.post("/fetchStory", isLogin, fetchStory);
//________________________________________________________________________add_story__________________________________
app.post("/addStory", isLogin, upload.single("file"), addstory);
//________________________________________________________________________seen_story__________________________________
app.post("/seenstory", isLogin, seenmystory);
//________________________________________________________________________like_story__________________________________
app.post("/likestory/:what", isLogin, likemystory);
//________________________________________________________________________add cmt in story______________________________________________________------
app.post("/commentonstory", isLogin, addcmtinstory);
//________________________________________________________________________fetch cmt in story______________________________________________________------
app.post("/fetchstorycomment", isLogin, fetchcmtinstory);
//________________________________________________________________________fetch views in story______________________________________________________------
app.post("/viewsdoplz", isLogin, fetchviewsinstory);
//________________________________________________________________________delete story______________________________________________________------
app.post("/deletestry", isLogin, deletestory);
//________________________________________________________________________edit relationship _______________________________________________--------
app.post("/saverelation", isLogin, edtrelationship);
//________________________________________________________________________add help_______________________________________________--------
app.post("/addhelp", isLogin, addhelp);
//________________________________________________________________________fetch help_______________________________________________--------
app.post("/laohelp", isLogin, fetchhelp);
//________________________________________________________________________delete or mark as read help_______________________________________________--------
app.post("/chghelp/:typ/:idx", isLogin, deleteorreadhelp);
//________________________________________________________________________fetch suggestion_______________________________________________--------
app.post("/laosuggest", isLogin, fetchsuggest);
//________________________________________________________________________delete or mark as read suggestion_______________________________________________--------
app.post("/chgsuggestion/:typ/:idx", isLogin, deleteorreadsuggest);
//________________________________________________________________________add report_______________________________________________--------
app.post("/addreport", isLogin, addreport);
//________________________________________________________________________fetch report_______________________________________________--------
app.post("/fetcreport", isLogin, fetcreport);
//________________________________________________________________________delete or mark as read report_______________________________________________--------
app.post("/chgreport/:typ/:idx", isLogin, deleteorreadreport);
//________________________________________________________________________automatically delete___story hidestory_______________________________________________________________

async function cleanUpExpiredEntries() {
    try {
        const currentDate = new Date();

        const usersWithExpiredStories = await UserInfo.find({
            $or: [
                { "story.datex": { $lte: currentDate } },
                { "hideStory.datex": { $lte: currentDate } }
            ]
        });

        let filenames = [];
        usersWithExpiredStories.forEach(user => {
            user.story.forEach(story => {
                if (story.datex <= currentDate && story.content?.filename) {
                    filenames.push(story.content.filename);
                }
            });
        });

        const result = await UserInfo.updateMany(
            {
                $or: [
                    { "story.datex": { $lte: currentDate } },
                    { "hideStory.datex": { $lte: currentDate } }
                ]
            },
            {
                $pull: {
                    story: { datex: { $lte: currentDate } },
                    hideStory: { datex: { $lte: currentDate } }
                }
            }
        );


        for (let filename of filenames) {
            await removeimage(filename);
        }

        console.log(`Expired stories removed from ${result.modifiedCount} documents.`);
    } catch (err) {
        console.error("Error cleaning up expired entries:", err);
    }
}

setInterval(cleanUpExpiredEntries, 60 * 60 * 1000);



//____________________________________________________________last _______________________________-------



app.use((err, req, res, next) => {
    console.error("Server error:", err);
    res.status(500).send({ message: "Something went wrong", color: "red" });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
});
