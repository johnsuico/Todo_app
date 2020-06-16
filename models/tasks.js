const mongoose = require("mongoose");

let taskSchema = new mongoose.Schema({
    task: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }
});

let Task = mongoose.model("task", taskSchema);

module.exports = Task;