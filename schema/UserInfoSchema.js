const mongo = require("mongoose")
const Schema = mongo.Schema;

const UserInfo = new Schema({
    info: {
        type: Schema.Types.ObjectId,
        ref: 'alluser',
    },
    searchHistory: [
        {
            type: String,
            _id: null
        },
    ],
    Notifications: [
        {
            seen: {
                type: Boolean,
                default: false,
            },
            datex: {
                type: Date,
                default: Date.now,
            },
            sender: {
                type: Schema.Types.ObjectId,
                ref: 'alluser',
            },
            sendertype: {
                type: String,
                required: true
            },
            msg: {
                type: String,
                required: true
            },
            postid: {
                type: Schema.Types.ObjectId,
                ref: 'postdata',
            },
            url: {
                type: String,
            }

        }
    ],
    saved: [
        {
            datex: {
                type: Date,
                default: Date.now,
            },
            type: {
                type: String,
            },
            post: {
                type: Schema.Types.ObjectId,
                ref: 'postdata'
            },
            audio: {
                type: Schema.Types.ObjectId,
                ref: 'audiodata'
            },
        },

    ],
    story: [
        {
            content: {
                path: {
                    type: String,
                },
                filename: {
                    type: String,
                },
            },
            msg: {
                type: String,
            },
            seen: [
                {
                    _id: false,
                    user: {
                        type: Schema.Types.ObjectId,
                        ref: "alluser",
                    },
                    like: {
                        type: Boolean,
                        default: false,
                    },
                    comment: {
                        msg: {
                            type: String,
                        },
                        datex: {
                            type: Date,
                        },
                    },
                },
            ],
            type: {
                type: String,
            },
            sharewith: {
                type: String,
            },
            datex: {
                type: Date,
                default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
            },

        }
    ],
    hideStory: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: "alluser",

            },
            datex: {
                type: Date,
                default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },


            _id: false,
        }
    ],
    closefrnd: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: "alluser",
            },
            _id: false,
        }
    ],
});


module.exports = mongo.model("UserInfo", UserInfo);

