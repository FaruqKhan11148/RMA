const Owner = require('../../../models/Owner');

// GET ALL PRODUCTS
async function getOwnerProducts(req, res) {
  try {
    const owner = await Owner.findById(req.owner._id).select(
      'shopId shopName products',
    );

    if (!owner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    return res.status(200).json({
      shopId: owner.shopId,
      shopName: owner.shopName,
      products: owner.products,
    });
  } catch (error) {
    console.error('Get owner products failed:', error);

    return res.status(500).json({
      message: 'Failed to load products',
    });
  }
}

// ADD PRODUCT
async function addProduct(req, res) {
  try {
    const {
      catalogueProductId,
      name,
      category,
      price,
      unit,
      imageUrl,
      isCustom,
    } = req.body;

    const trimmedName = String(name || '').trim();
    const trimmedCategory = String(category || '').trim();
    const trimmedUnit = String(unit || '').trim();
    const productPrice = Number(price);

    if (!trimmedName) {
      return res.status(400).json({
        message: 'Product name is required',
      });
    }

    if (!trimmedCategory) {
      return res.status(400).json({
        message: 'Product category is required',
      });
    }

    if (!trimmedUnit) {
      return res.status(400).json({
        message: 'Product unit is required',
      });
    }

    if (!Number.isFinite(productPrice) || productPrice <= 0) {
      return res.status(400).json({
        message: 'Product price must be greater than 0',
      });
    }

    const customProduct = Boolean(isCustom);

    // Catalogue product duplicate check
    if (!customProduct && catalogueProductId) {
      const alreadyExists = req.owner.products.some(
        (product) => product.catalogueProductId === catalogueProductId,
      );

      if (alreadyExists) {
        return res.status(400).json({
          message: 'This catalogue product is already added',
        });
      }
    }

    const newProduct = {
      productId: customProduct ? `CUSTOM_${Date.now()}` : `P${Date.now()}`,

      catalogueProductId: customProduct ? null : catalogueProductId || null,

      name: trimmedName,
      category: trimmedCategory,
      price: productPrice,
      unit: trimmedUnit,
      imageUrl: String(imageUrl || '').trim(),

      isCustom: customProduct,
      available: true,
    };

    const updatedOwner = await Owner.findByIdAndUpdate(
      req.owner._id,
      {
        $push: {
          products: newProduct,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    return res.status(201).json({
      message: 'Product added successfully',
      product: newProduct,
      products: updatedOwner.products,
    });
  } catch (error) {
    console.error('Add product failed:', error);

    return res.status(500).json({
      message: 'Failed to add product',
    });
  }
}

// CHANGE PRODUCT PRICE
async function changeProductPrice(req, res) {
  try {
    const { productId } = req.params;
    const productPrice = Number(req.body.price);

    if (!Number.isFinite(productPrice) || productPrice <= 0) {
      return res.status(400).json({
        message: 'Product price must be greater than 0',
      });
    }

    const productExists = req.owner.products.some(
      (product) => product.productId === productId,
    );

    if (!productExists) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    const updatedOwner = await Owner.findOneAndUpdate(
      {
        _id: req.owner._id,
        'products.productId': productId,
      },
      {
        $set: {
          'products.$.price': productPrice,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    const updatedProduct = updatedOwner.products.find(
      (product) => product.productId === productId,
    );

    return res.status(200).json({
      message: 'Product price updated successfully',
      product: updatedProduct,
      products: updatedOwner.products,
    });
  } catch (error) {
    console.error('Change product price failed:', error);

    return res.status(500).json({
      message: 'Failed to update product price',
    });
  }
}

// EDIT CUSTOM PRODUCT
async function editCustomProduct(req, res) {
  try {
    const { productId } = req.params;

    const product = req.owner.products.find(
      (item) => item.productId === productId,
    );

    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    // Catalogue products are controlled by RMA
    if (!product.isCustom) {
      return res.status(400).json({
        message:
          'Catalogue products cannot be edited. Only price and availability can be changed.',
      });
    }

    const { name, category, price, unit, imageUrl } = req.body;

    const trimmedName = String(name || '').trim();
    const trimmedCategory = String(category || '').trim();
    const trimmedUnit = String(unit || '').trim();
    const productPrice = Number(price);

    if (!trimmedName) {
      return res.status(400).json({
        message: 'Product name is required',
      });
    }

    if (!trimmedCategory) {
      return res.status(400).json({
        message: 'Product category is required',
      });
    }

    if (!trimmedUnit) {
      return res.status(400).json({
        message: 'Product unit is required',
      });
    }

    if (!Number.isFinite(productPrice) || productPrice <= 0) {
      return res.status(400).json({
        message: 'Product price must be greater than 0',
      });
    }

    const updatedOwner = await Owner.findOneAndUpdate(
      {
        _id: req.owner._id,
        'products.productId': productId,
      },
      {
        $set: {
          'products.$.name': trimmedName,
          'products.$.category': trimmedCategory,
          'products.$.price': productPrice,
          'products.$.unit': trimmedUnit,
          'products.$.imageUrl': String(imageUrl || '').trim(),
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    const updatedProduct = updatedOwner.products.find(
      (item) => item.productId === productId,
    );

    return res.status(200).json({
      message: 'Product updated successfully',
      product: updatedProduct,
      products: updatedOwner.products,
    });
  } catch (error) {
    console.error('Edit product failed:', error);

    return res.status(500).json({
      message: 'Failed to update product',
    });
  }
}

// CHANGE PRODUCT AVAILABILITY
async function changeProductAvailability(req, res) {
  try {
    const { productId } = req.params;
    const { available } = req.body;

    if (typeof available !== 'boolean') {
      return res.status(400).json({
        message: 'Product availability must be true or false',
      });
    }

    const updatedOwner = await Owner.findOneAndUpdate(
      {
        _id: req.owner._id,
        'products.productId': productId,
      },
      {
        $set: {
          'products.$.available': available,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    const updatedProduct = updatedOwner.products.find(
      (product) => product.productId === productId,
    );

    return res.status(200).json({
      message: available
        ? 'Product is now available'
        : 'Product is now unavailable',

      product: updatedProduct,
      products: updatedOwner.products,
    });
  } catch (error) {
    console.error('Change product availability failed:', error);

    return res.status(500).json({
      message: 'Failed to update product availability',
    });
  }
}

// REMOVE PRODUCT
async function removeProduct(req, res) {
  try {
    const { productId } = req.params;

    const productExists = req.owner.products.some(
      (product) => product.productId === productId,
    );

    if (!productExists) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    const updatedOwner = await Owner.findByIdAndUpdate(
      req.owner._id,
      {
        $pull: {
          products: {
            productId,
          },
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    return res.status(200).json({
      message: 'Product removed successfully',
      products: updatedOwner.products,
    });
  } catch (error) {
    console.error('Remove product failed:', error);

    return res.status(500).json({
      message: 'Failed to remove product',
    });
  }
}

module.exports = {
  getOwnerProducts,
  addProduct,
  changeProductPrice,
  editCustomProduct,
  changeProductAvailability,
  removeProduct,
};
