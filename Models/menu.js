const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
  {
    Name: { type: String, required: true },
    Description: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    category: { type: String, required: true },
    type: { type: String, required: true },
    fssaiLicense: { type: String, required: true },

    shelfLife: String,
    returnPolicy: String,
    storageTips: String,
    unitNumber: Number,
    unit: String,
    keyFeatures: String,

    manufacturerName: String,
    manufacturerAddress: String,
    customerCareDetails: String,

    primaryPhoto: String,
    photos: [String],

    deliveryTime: Number,
    customDetails: { type: Object, default: {} },
  },
  { timestamps: true }
);

menuSchema.virtual("finalPrice").get(function () {
  return this.discount
    ? this.price - (this.price * this.discount) / 100
    : this.price;
});

menuSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Menu", menuSchema);
