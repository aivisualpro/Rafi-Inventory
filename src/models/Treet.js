import mongoose from "mongoose";

const TreetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["Wellness Shot", "Smoothie", "Juice", "Dessert", "Snack", "Other"],
      required: true,
    },
    dateMade: { type: Date },
    expirationDate: { type: Date },
    batchSize: { type: Number, default: 1 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Treet || mongoose.model("Treet", TreetSchema);
