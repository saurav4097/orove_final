import mongoose, { Schema, models, model } from "mongoose";

const querySchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Query || mongoose.model("Query", querySchema);