const mongo = require("mongoose")
const Schema = mongo.Schema;
const passLocalMongo = require("passport-local-mongoose")


const userscma = new Schema({
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    gender: {
        value: {
            type: String,
            required: true
        },
        show: {
            type: Boolean,
            default: true
        }
    },
    birthdate: {
        datex: {
            type: Date,
            required: true
        },
        img: {
            type: String,
            default: "1"
        },
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bio: {
        type: String,
        default: "Hello, i am new user\ntrying to connect with new people"
    },
    lastUsernameUpdate: {
        datex: {
            type: Date,
        },
        is: {
            type: Boolean,
            default: false,
        }
    },
    pic: {
        path: {
            type: String,
            default: "/svg/userm.jpg"
        },
        filename: {
            type: String,
            default: "no"
        }
    },
    badge: {
        color: {
            type: String,
            default: "rgb(100,100,100)"
        },
        msg: {
            type: String,
            default: "insta user"
        },
        show: {
            type: Boolean,
            default: true
        },

    },
    relationship: {
        typ: {
            type: String,
            default: "hidden"
        },
        show: {
            type: Boolean,
            default: false,
        },
    },
    post: [{
        type: Schema.Types.ObjectId,
        ref: 'postdata',
    }],
    links: {
        allLinks: [
            {
                name: {
                    type: String,
                    required: true,
                },
                link: {
                    type: String,
                    required: true,
                },
            },
        ],
        show: {
            type: Boolean,
            default: true,
        },
    }


});
userscma.plugin(passLocalMongo);


module.exports = mongo.model("alluser", userscma);