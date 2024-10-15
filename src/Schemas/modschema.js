const { model, Schema } = require("mongoose");

let modSchema = new Schema({
    Guild: String,
    User: String,
})

module.exports = model("mmailschemaa", modSchema);