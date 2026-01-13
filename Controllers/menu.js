const Menu = require("../Models/menu");

// Get categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Menu.distinct("category");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all menu items
exports.getAllMenuItems = async (req, res) => {
  try {
    const items = await Menu.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add menu item
exports.addMenuItem = async (req, res) => {
  try {
    const photos = req.files ? req.files.map(f => f.path) : [];

    const primaryPhoto = photos[0] || null;
    const otherPhotos = photos.slice(1);

    let customDetails = {};
    if (Array.isArray(req.body.customKeys)) {
      req.body.customKeys.forEach((key, i) => {
        if (key && req.body.customValues[i]) {
          customDetails[key] = req.body.customValues[i];
        }
      });
    }

    const item = new Menu({
      ...req.body,
      primaryPhoto,
      photos: otherPhotos,
      customDetails,
    });

    await item.save();
    res.redirect("/menu");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving menu item");
  }
};

// Update menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) return res.status(404).send("Not found");

    let photos = item.photos || [];
    let primaryPhoto = item.primaryPhoto;

    if (req.files && req.files.length > 0) {
      const uploaded = req.files.map(f => f.path);
      primaryPhoto = uploaded[0];
      photos = photos.concat(uploaded.slice(1));
    }

    let customDetails = {};
    if (Array.isArray(req.body.customKeys)) {
      req.body.customKeys.forEach((key, i) => {
        if (key && req.body.customValues[i]) {
          customDetails[key] = req.body.customValues[i];
        }
      });
    }

    await Menu.findByIdAndUpdate(req.params.id, {
      ...req.body,
      primaryPhoto,
      photos,
      customDetails,
    });

    res.redirect("/menu");
  } catch (err) {
    console.error(err);
    res.status(500).send("Update failed");
  }
};

// Delete menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    await Menu.findByIdAndDelete(req.params.id);
    res.redirect("/menu");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get item for edit
exports.getMenuItemForEdit = async (req, res) => {
  const menuItem = await Menu.findById(req.params.id);
  if (!menuItem) return res.status(404).send("Not found");
  res.render("edit", { menuItem });
};
