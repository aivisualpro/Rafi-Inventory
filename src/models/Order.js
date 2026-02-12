import mongoose from "mongoose";

if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

const OrderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  size: { type: String, default: "" },
  parQty: { type: Number, default: 1 },
  currentStock: { type: Number, default: 0 },
  orderQty: { type: Number, default: 0 },
  unit: { type: String, default: "" },
  notes: { type: String, default: "" },
});

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    vendorName: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "submitted", "received", "cancelled"],
      default: "draft",
    },
    items: [OrderItemSchema],
    orderDate: { type: Date, default: Date.now },
    expectedDelivery: { type: Date },
    receivedDate: { type: Date },
    notes: { type: String, default: "" },
    totalItems: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-generate order number before save
OrderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.models.Order.countDocuments();
    const date = new Date();
    const prefix = `ORD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
    this.orderNumber = `${prefix}-${String(count + 1).padStart(4, "0")}`;
  }
  this.totalItems = this.items.reduce((sum, i) => sum + (i.orderQty || 0), 0);
  next();
});

export default mongoose.model("Order", OrderSchema);
