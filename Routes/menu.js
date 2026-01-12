const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../configs/cloudinary'); // Cloudinary storage
const upload = multer({ storage });

const {
    getAllCategories,
    getAllMenuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getMenuItemForEdit
} = require('../Controllers/menu');

const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

// Public routes
router.get('/categories', getAllCategories);
router.get('/item', getAllMenuItems);

// Admin routes
router.get('/create', authenticateJWT, authorizeRoles('admin'), (req, res) => res.render('create'));
router.post('/create', authenticateJWT, authorizeRoles('admin'), upload.array('photos', 10), addMenuItem);

router.get('/edit/:id', authenticateJWT, authorizeRoles('admin'), getMenuItemForEdit);
router.post('/:id', authenticateJWT, authorizeRoles('admin'), upload.array('photos', 10), updateMenuItem);

router.get('/delete/:id', authenticateJWT, authorizeRoles('admin'), deleteMenuItem);

router.get('/', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
    const menuItems = await require('../Models/menu').find();
    res.render('menu', { menuItems });
});

module.exports = router;
