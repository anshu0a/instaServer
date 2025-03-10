const mongo = require("mongoose")
const Schema = mongo.Schema

const followData = new Schema({
    user1: {
        type: Schema.Types.ObjectId,
        ref: 'alluser',
    },
    user2: {
        type: Schema.Types.ObjectId,
        ref: 'alluser',
    },
    back: {
        type: Boolean,
        default: false
    },
    date1: {
        type: Date

    },
    date2: {
        type: Date

    }

})

module.exports = mongo.model("followData",followData)