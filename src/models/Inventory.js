import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, default: "" },
    category: {
      type: String,
      enum: [
        "Juicing Produce",
        "Produce for Daily Use",
        "Frozen Goods",
        "Bread",
        "Dairy/Liquid",
        "Herbs",
        "Salad Items",
        "Other",
      ],
      required: true,
    },
    notes: { type: String, default: "" },
    weekdayPar: { type: Number, default: 0 },
    weekendPar: { type: Number, default: 0 },
    currentStock: { type: Number, default: 0 },
    unit: { type: String, default: "each" },
    supplier: { type: String, default: "" },
    lastOrdered: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Inventory ||
  mongoose.model("Inventory", InventorySchema);
