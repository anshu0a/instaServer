const mongo = require("mongoose")
const Schema = mongo.Schema;

const msgData = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'alluser',
        required: true
    },
    reciever: {
        type: Schema.Types.ObjectId,
        ref: 'alluser',
        required: true,
    },
    msg: {
        type: String,
    },
    photo:{
        path:{
            type: String,
        },
        filename:{
            type: String,
        }
    },
    msgtime: {
        type: Date,
        default: Date.now,
    },
    seen:{
        type:Boolean,
        default:false
    },
    reply:{
        type: Schema.Types.ObjectId,
        ref: 'msgData',
    },
    del:{
        type: String,
    }



});


module.exports = mongo.model("msgData", msgData);