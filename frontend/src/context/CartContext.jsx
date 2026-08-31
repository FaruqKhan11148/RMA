import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('rma_cart');

    return savedCart ? JSON.parse(savedCart) : [];
  });

  const addToCart = (product, shop) => {
    setCartItems((currentItems) => {
      // Cart is empty
      if (currentItems.length === 0) {
        return [
          {
            product,
            ownerId: shop._id,
            shopId: shop.shopId,
            shopName: shop.shopName,
            shopDelivery: shop.delivery,
            shopPickup: shop.pickup,
            quantity: 1,
          },
        ];
      }

      // Cart belongs to another shop
      const currentShopId = currentItems[0].shopId;

      if (currentShopId !== shop.shopId) {
        const confirmChange = window.confirm(
          `Your cart contains items from ${currentItems[0].shopName}. Do you want to clear the cart and order from ${shop.shopName}?`,
        );

        if (!confirmChange) {
          return currentItems;
        }

        return [
          {
            product,
            ownerId: shop._id,
            shopId: shop.shopId,
            shopName: shop.shopName,
            shopDelivery: shop.delivery,
            shopPickup: shop.pickup,
            quantity: 1,
          },
        ];
      }

      // Same shop → check if product already exists
      const existingItem = currentItems.find(
        (item) => item.product.productId === product.productId,
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.product.productId === product.productId
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      // New product from same shop
      return [
        ...currentItems,
        {
          product,
          ownerId: shop._id,
          shopId: shop.shopId,
          shopName: shop.shopName,
          shopDelivery: shop.delivery,
          shopPickup: shop.pickup,
          quantity: 1,
        },
      ];
    });
  };

  useEffect(() => {
    localStorage.setItem('rma_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const increaseQuantity = (productId) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.product.productId === productId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  };

  const decreaseQuantity = (productId) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item.product.productId === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.product.productId !== productId),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );

  const value = {
    cartItems,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
