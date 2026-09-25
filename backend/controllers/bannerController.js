import mongoose from "mongoose";
import BannerSettings from "../models/bannerSettingsModel.js";
import Product from "../models/productModel.js";

const SETTINGS_ID = "homepage";
const bannerFields = {
  hero: "heroProduct",
  footer: "footerProduct",
};

export const getBannerSettings = async (req, res) => {
  try {
    const settings = await BannerSettings.findById(SETTINGS_ID)
      .populate("heroProduct")
      .populate("footerProduct");

    res.json({
      heroProduct: settings?.heroProduct || null,
      footerProduct: settings?.footerProduct || null,
    });
  } catch (error) {
    console.error("Error fetching banner settings:", error);
    res.status(500).json({ message: "Unable to fetch banner settings" });
  }
};

export const updateBannerSelection = async (req, res) => {
  if (!req.isAdmin) {
    return res.status(403).json({ message: "Forbidden: admin only" });
  }

  const field = bannerFields[req.params.type];
  const { productId } = req.body;
  if (!field) {
    return res.status(400).json({ message: "Invalid banner type" });
  }
  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ message: "A valid productId is required" });
  }

  try {
    const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    const settings = await BannerSettings.findByIdAndUpdate(
      SETTINGS_ID,
      { $set: { [field]: productId } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
      .populate("heroProduct")
      .populate("footerProduct");

    res.json({
      heroProduct: settings.heroProduct || null,
      footerProduct: settings.footerProduct || null,
    });
  } catch (error) {
    console.error("Error updating banner settings:", error);
    res.status(500).json({ message: "Unable to update banner settings" });
  }
};