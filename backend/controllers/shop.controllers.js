import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const buildPublicFileUrl = (req, fileName) =>
  `${req.protocol}://${req.get("host")}/public/${fileName}`;

export const createEditShop = async (req, res) => {
  try {
    const { name, city, state, address, lat, lng } = req.body;

    let image;

    if (req.file) {
      image = buildPublicFileUrl(req, req.file.filename);

      try {
        const uploadedImage = await uploadOnCloudinary(req.file.path);

        if (uploadedImage) {
          image = uploadedImage;
        }
      } catch (error) {
        console.log("Cloudinary failed, using local shop image");
      }
    }

    let shop = await Shop.findOne({ owner: req.userId });

    if (!shop) {
      shop = await Shop.create({
        name,
        city,
        state,
        address,
        image,
        location: {
          lat: lat ? Number(lat) : null,
          lng: lng ? Number(lng) : null,
        },
        owner: req.userId
      });
    } else {
      shop = await Shop.findByIdAndUpdate(
        shop._id,
        {
          name,
          city,
          state,
          address,
          image: image || shop.image,
          location: {
            lat: lat ? Number(lat) : shop.location?.lat ?? null,
            lng: lng ? Number(lng) : shop.location?.lng ?? null,
          },
          owner: req.userId
        },
        { new: true }
      );
    }

    await shop.populate("owner items");

    return res.status(201).json(shop);

  } catch (error) {
    return res.status(500).json({
      message: `create shop error
      ${error}`
    });
  }
};

export const getMyShop = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const shop = await Shop.findOne({ owner: req.userId }).populate("items owner");

    if (!shop) {
      return res.status(404).json({
        message: "Shop not found",
      });
    }

    res.status(200).json(shop);
  } catch (error) {
    console.log("Get my shop error", error);
    res.status(500).json({
      message: "Get my shop error",
    });
  }
};

export const getAllShops = async (_req, res) => {
  try {
    const shops = await Shop.find()
      .populate("items owner")
      .sort({ createdAt: -1 });

    return res.status(200).json(shops);
  } catch (error) {
    console.log("Get all shops error", error);
    return res.status(500).json({
      message: "Get all shops error",
    });
  }
};
