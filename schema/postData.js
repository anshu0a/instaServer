const mongo = require("mongoose");
const Schema = mongo.Schema;

const postData = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'alluser',
    },
    postimg: {
        path: {
            type: String,
            required: true
        },
        filename: {
            type: String
        }
    },
    posttime: {
        type: Date,
        default: Date.now
    },
    location: {
        type: String,
    },
    description: {
        type: String,
    },
    edit: {
        type: Boolean,
        default: false
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'alluser',
    }],
    archieve: {
        type: Boolean,
        default: false
    },
    takedown: {
        type: Boolean,
        default: false
    },
    comment: [{
        info: {
            type: Schema.Types.ObjectId,
            ref: 'alluser',
        },
        dtl: {
            type: String,
        },
        datex: {
            type: Date,
            default: Date.now

        },
        reply: [{
            info: {
                type: Schema.Types.ObjectId,
                ref: 'alluser',
            },
            dtl: {
                type: String,
            },
            datex: {
                type: Date,
                default: Date.now

            },
        }]
    }],
});

module.exports = mongo.model("postdata", postData);
