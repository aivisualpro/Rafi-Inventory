import mongoose from "mongoose";

if (mongoose.models.Vendor) {
  delete mongoose.models.Vendor;
}

const VendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contactName: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    categories: [{ type: String }],
    accountNumber: { type: String, default: "" },
    deliveryDays: [{ type: String }],
    notes: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Vendor", VendorSchema);
