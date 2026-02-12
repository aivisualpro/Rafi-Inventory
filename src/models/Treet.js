import mongoose from "mongoose";

// Delete cached model to pick up schema changes in dev
if (mongoose.models.Treet) {
  delete mongoose.models.Treet;
}

const TreetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    dateMade: { type: Date },
    expirationDate: { type: Date },
    batchSize: { type: Number, default: 1 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Treet", TreetSchema);
