import mongoose from "mongoose";

const bannerSettingsSchema = new mongoose.Schema({
  _id: { type: String, default: "homepage" },
  heroProduct: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
  footerProduct: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
}, { timestamps: true });

const BannerSettings = mongoose.models.BannerSettings || mongoose.model("BannerSettings", bannerSettingsSchema);

export default BannerSettings;