import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  response: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Note = mongoose.model("Note", noteSchema);
export default Note;
