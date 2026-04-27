import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const buildPublicFileUrl = (req, fileName) =>
  `${req.protocol}://${req.get("host")}/public/${fileName}`;

const parseBoolean = (value) => value === true || value === "true";

const parseNumber = (value, fallback = 0) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

// ================= ADD ITEM =================
export const addItem = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const {
      name,
      price,
      category,
      foodType,
      shopId,
      isPopular,
      discount,
      ratingsCount,
    } = req.body;

    // validation
    if (!name || !price || !category || !foodType || !shopId) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // ================= IMAGE HANDLING =================
    let imageUrl = "";

    if (req.file) {
      console.log("FILE RECEIVED:", req.file);

      // fallback local image
      imageUrl = buildPublicFileUrl(req, req.file.filename);

      try {
        const result = await uploadOnCloudinary(req.file.path);

        if (result) {
          imageUrl = result;
        }
      } catch (error) {
        console.log("Cloudinary failed, using local image");
      }
    }

    // if still no image
    if (!imageUrl) {
      return res.status(400).json({
        message: "Image is required",
      });
    }

    // ================= SAVE ITEM =================
    const item = new Item({
      name,
      price: parseNumber(price),
      category,
      foodType,
      shop: shopId,
      image: imageUrl,
      isPopular: parseBoolean(isPopular),
      discount: parseNumber(discount),
      ratingsCount: parseNumber(ratingsCount),
    });

    await item.save();
    await Shop.findByIdAndUpdate(shopId, {
      $addToSet: {
        items: item._id,
      },
    });

    res.status(201).json({
      success: true,
      item,
    });
  } catch (error) {
    console.log("ADD ITEM ERROR:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= EDIT ITEM =================
export const editItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const {
      name,
      category,
      foodType,
      price,
      isPopular,
      discount,
      ratingsCount,
    } = req.body;

    let updateData = {};

    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (foodType !== undefined) updateData.foodType = foodType;
    if (price !== undefined) updateData.price = parseNumber(price);
    if (isPopular !== undefined) updateData.isPopular = parseBoolean(isPopular);
    if (discount !== undefined) updateData.discount = parseNumber(discount);
    if (ratingsCount !== undefined) {
      updateData.ratingsCount = parseNumber(ratingsCount);
    }

    // if new image uploaded
    if (req.file) {
      let imageUrl = buildPublicFileUrl(req, req.file.filename);

      try {
        const result = await uploadOnCloudinary(req.file.path);

        if (result) {
          imageUrl = result;
        }
      } catch (error) {
        console.log("Cloudinary failed, using local image");
      }

      updateData.image = imageUrl;
    }

    const updatedItem = await Item.findByIdAndUpdate(
      itemId,
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      item: updatedItem,
    });
  } catch (error) {
    console.log("EDIT ITEM ERROR:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getItemsByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const items = await Item.find({ shop: shopId }).sort({ createdAt: -1 });

    return res.status(200).json(items);
  } catch (error) {
    console.log("GET ITEMS ERROR:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};
