const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mainDataSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        ref: 'alluser',
    },
    improve: [{
        msg: {
            type: String,
        },
        datex: {
            type: Date,
            default: Date.now
        },
        respond: {
            type: Boolean,
            default: false
        }
    }],
    help: [
        {
            type: {
                type: String,

            },
            msg: {
                type: String,

            },
            respond: {
                type: Boolean,
                default: false
            },
            datex: {
                type: Date,
                default: Date.now
            },
        }
    ],
    report: [{
        title: {
            type: String,
        },
        postid: {
            type: Schema.Types.ObjectId,
            ref: 'postdata',
        },
        userid: {
            type: Schema.Types.ObjectId,
            ref: 'alluser',
        },
        datex: {
            type: Date,
            default: Date.now
        },
        report: {
            type: String,

        },
        respond: {
            type: Boolean,
            default: false
        },
    }]
});

module.exports = mongoose.model("mainData", mainDataSchema);
