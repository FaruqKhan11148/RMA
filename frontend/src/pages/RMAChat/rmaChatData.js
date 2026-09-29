const rmaChatData = {
  customer: {
    main: {
      message: 'Hi! How can RMA help you today?',
      options: [
        {
          id: 'orders',
          label: 'My Order',
          next: 'orders',
        },
        {
          id: 'payment',
          label: 'Payment',
          next: 'payment',
        },
        {
          id: 'refund',
          label: 'Refund',
          next: 'refund',
        },
        {
          id: 'delivery',
          label: 'Delivery',
          next: 'delivery',
        },
        {
          id: 'shop',
          label: 'Shop',
          next: 'shop',
        },
        {
          id: 'account',
          label: 'Account',
          next: 'account',
        },
      ],
    },

    orders: {
      message: 'What do you need help with regarding your order?',
      options: [
        {
          id: 'order_status',
          label: 'Check order status',
          answer:
            'You can check your latest order status from the Orders section in your RMA account.',
          next: 'orders',
        },
        {
          id: 'order_not_received',
          label: 'Order not received',
          answer:
            'If your order has not arrived within the expected time, please check the Delivery Status page first.',
          next: 'orders',
        },
        {
          id: 'cancel_order',
          label: 'Cancel my order',
          answer:
            'Order cancellation depends on the current order status. If cancellation is available, use the cancellation option from your order.',
          next: 'orders',
        },
        {
          id: 'wrong_order',
          label: 'Wrong order received',
          answer:
            'Please contact RMA Support with your order details so we can help you with the issue.',
          next: 'orders',
        },
        {
          id: 'orders_main',
          label: 'Main Menu',
          next: 'main',
        },
      ],
    },

    payment: {
      message: 'What payment issue are you facing?',
      options: [
        {
          id: 'payment_failed',
          label: 'Payment failed',
          answer:
            'If your payment failed, please check whether your bank or UPI app shows the transaction as successful before trying again.',
          next: 'payment',
        },
        {
          id: 'payment_deducted',
          label: 'Money deducted but order not confirmed',
          answer:
            'If money was deducted but your order was not confirmed, please keep the transaction details and contact RMA Support.',
          next: 'payment',
        },
        {
          id: 'payment_methods',
          label: 'Supported payment methods',
          answer:
            'RMA supports the payment methods available through the payment gateway during checkout.',
          next: 'payment',
        },
        {
          id: 'payment_main',
          label: 'Main Menu',
          next: 'main',
        },
      ],
    },

    refund: {
      message: 'What do you need help with regarding your refund?',
      options: [
        {
          id: 'refund_status',
          label: 'Refund status',
          answer:
            'Refund processing time can depend on the payment method and payment provider.',
          next: 'refund',
        },
        {
          id: 'rejected_refund',
          label: 'Rejected order refund',
          answer:
            'If your order was rejected after payment, check your order details first. If the refund is not reflected, contact RMA Support.',
          next: 'refund',
        },
        {
          id: 'wrong_refund',
          label: 'Wrong refund amount',
          answer:
            'If the refunded amount appears incorrect, please contact RMA Support with your order and payment details.',
          next: 'refund',
        },
        {
          id: 'refund_main',
          label: 'Main Menu',
          next: 'main',
        },
      ],
    },

    delivery: {
      message: 'What do you need help with regarding delivery?',
      options: [
        {
          id: 'delivery_late',
          label: 'Delivery is late',
          answer:
            'You can check the current order status from the Delivery Status page.',
          next: 'delivery',
        },
        {
          id: 'wrong_address',
          label: 'Wrong delivery address',
          answer:
            'If the order has not been dispatched yet, contact the shop as soon as possible about the address.',
          next: 'delivery',
        },
        {
          id: 'track_delivery',
          label: 'Track my delivery',
          answer:
            'Open your Delivery Status page to see the latest status of your order.',
          next: 'delivery',
        },
        {
          id: 'delivery_main',
          label: 'Main Menu',
          next: 'main',
        },
      ],
    },

    shop: {
      message: 'What do you need help with regarding the shop?',
      options: [
        {
          id: 'shop_closed',
          label: 'Shop is closed',
          answer:
            'Shop availability depends on the shop owner settings and opening hours.',
          next: 'shop',
        },
        {
          id: 'product_unavailable',
          label: 'Product unavailable',
          answer:
            'A product may temporarily be unavailable if the shop owner has marked it unavailable.',
          next: 'shop',
        },
        {
          id: 'wrong_product',
          label: 'Wrong product',
          answer:
            'If you received a different product from what you ordered, contact RMA Support with your order details.',
          next: 'shop',
        },
        {
          id: 'shop_main',
          label: 'Main Menu',
          next: 'main',
        },
      ],
    },

    account: {
      message: 'What do you need help with regarding your account?',
      options: [
        {
          id: 'cannot_login',
          label: 'Cannot log in',
          answer:
            'Check your registered mobile number and try logging in again. If the problem continues, contact RMA Support.',
          next: 'account',
        },
        {
          id: 'update_profile',
          label: 'Update my profile',
          answer:
            'You can manage your profile information from the Profile section.',
          next: 'account',
        },
        {
          id: 'manage_addresses',
          label: 'Manage my addresses',
          answer:
            'Your saved delivery addresses can be managed from your profile.',
          next: 'account',
        },
        {
          id: 'account_main',
          label: 'Main Menu',
          next: 'main',
        },
      ],
    },

    end: {
      message:
        'Thanks for contacting RMA Support. If you need anything else, you can start a new chat anytime.',
      options: [],
    },
  },

  owner: {
    main: {
      message: 'Hi! How can RMA help you with your shop today?',
      options: [
        {
          id: 'owner_orders',
          label: 'Orders',
          next: 'orders',
        },
        {
          id: 'owner_shop',
          label: 'Shop',
          next: 'shop',
        },
        {
          id: 'owner_products',
          label: 'Products',
          next: 'products',
        },
        {
          id: 'owner_payments',
          label: 'Payments & Earnings',
          next: 'payments',
        },
        {
          id: 'owner_delivery',
          label: 'Delivery',
          next: 'delivery',
        },
        {
          id: 'owner_account',
          label: 'Account',
          next: 'account',
        },
      ],
    },

    orders: {
      message: 'What do you need help with regarding your shop orders?',
      options: [
        {
          id: 'new_orders',
          label: 'New orders',
          answer:
            'New customer orders can be viewed from your Owner Dashboard.',
          next: 'orders',
        },
        {
          id: 'order_status',
          label: 'Order status',
          answer:
            'You can update and manage the order status from the order management section.',
          next: 'orders',
        },
        {
          id: 'order_issue',
          label: 'Order issue',
          answer:
            'For an order-specific issue, open the order details and review the customer and delivery information.',
          next: 'orders',
        },
        {
          id: 'orders_main',
          label: 'Main Menu',
          next: 'main',
        },
      ],
    },

    shop: {
      message: 'What do you need help with regarding your shop?',
      options: [
        {
          id: 'shop_status',
          label: 'Open / Closed status',
          answer:
            'Your shop availability can be managed through the shop settings.',
          next: 'shop',
        },
        {
          id: 'delivery_settings',
          label: 'Delivery settings',
          answer:
            'Delivery availability, radius, minimum order and delivery charges can be managed from Delivery Settings.',
          next: 'shop',
        },
        {
          id: 'pickup_settings',
          label: 'Pickup settings',
          answer: 'Pickup availability can be managed from your shop settings.',
          next: 'shop',
        },
        {
          id: 'shop_main',
          label: 'Main Menu',
          next: 'main',
        },
      ],
    },

    products: {
      message: 'What do you need help with regarding your products?',
      options: [
        {
          id: 'add_product',
          label: 'Add products',
          answer:
            'You can add your shop products from the Products section of your Owner Dashboard.',
          next: 'products',
        },
        {
          id: 'product_price',
          label: 'Change product price',
          answer:
            'Product pricing can be managed according to the product type and catalogue rules.',
          next: 'products',
        },
        {
          id: 'product_available',
          label: 'Product availability',
          answer:
            'You can mark products as available or unavailable from the Products section.',
          next: 'products',
        },
        {
          id: 'products_main',
          label: 'Main Menu',
          next: 'main',
        },
      ],
    },

    payments: {
      message: 'What do you need help with regarding payments and earnings?',
      options: [
        {
          id: 'owner_settlement',
          label: 'Settlement',
          answer:
            'Shop settlements are processed according to the payment and settlement setup configured for your account.',
          next: 'payments',
        },
        {
          id: 'rma_fee',
          label: 'RMA platform fee',
          answer:
            'RMA applies the platform fee configured for your shop account. You can review applicable fee information from the owner payment section.',
          next: 'payments',
        },
        {
          id: 'payment_issue',
          label: 'Payment issue',
          answer:
            'For a payment-specific issue, keep the order and transaction details available when contacting RMA Support.',
          next: 'payments',
        },
        {
          id: 'payments_main',
          label: 'Main Menu',
          next: 'main',
        },
      ],
    },

    delivery: {
      message: 'What do you need help with regarding delivery?',
      options: [
        {
          id: 'delivery_available',
          label: 'Delivery availability',
          answer:
            'You can enable or disable delivery from your shop delivery settings.',
          next: 'delivery',
        },
        {
          id: 'delivery_charge',
          label: 'Delivery charges',
          answer:
            'Delivery charges and related settings can be managed from Delivery Settings.',
          next: 'delivery',
        },
        {
          id: 'delivery_partner',
          label: 'Delivery partner',
          answer:
            'Orders requiring delivery can be handled according to the delivery setup available for your shop.',
          next: 'delivery',
        },
        {
          id: 'delivery_main',
          label: 'Main Menu',
          next: 'main',
        },
      ],
    },

    account: {
      message: 'What do you need help with regarding your owner account?',
      options: [
        {
          id: 'owner_profile',
          label: 'Profile settings',
          answer:
            'Your owner profile and shop settings can be managed from the Owner Profile section.',
          next: 'account',
        },
        {
          id: 'owner_login',
          label: 'Login issue',
          answer:
            'Check your registered owner credentials and try logging in again. If the problem continues, contact RMA Support.',
          next: 'account',
        },
        {
          id: 'account_main',
          label: 'Main Menu',
          next: 'main',
        },
      ],
    },

    end: {
      message:
        'Thanks for contacting RMA Support. If you need anything else, you can start a new chat anytime.',
      options: [],
    },
  },

  delivery: {
    main: {
      message: 'Hi! How can RMA help you with your delivery work today?',
      options: [
        {
          id: 'delivery_orders',
          label: 'Orders',
          next: 'orders',
        },
        {
          id: 'delivery_status',
          label: 'Delivery',
          next: 'delivery',
        },
        {
          id: 'delivery_earnings',
          label: 'Earnings',
          next: 'earnings',
        },
        {
          id: 'delivery_account',
          label: 'Account',
          next: 'account',
        },
      ],
    },

    orders: {
      message: 'What do you need help with regarding your orders?',
      options: [
        {
          id: 'available_orders',
          label: 'Available orders',
          answer:
            'Available delivery orders can be viewed from your Delivery Dashboard.',
          next: 'orders',
        },
        {
          id: 'accept_order',
          label: 'Accepting an order',
          answer:
            'When an eligible delivery order is available, you can review its details and accept it from the delivery order section.',
          next: 'orders',
        },
        {
          id: 'order_issue',
          label: 'Order issue',
          answer:
            'For an order-specific issue, review the order details and contact RMA Support if further help is needed.',
          next: 'orders',
        },
        {
          id: 'orders_main',
          label: 'Main Menu',
          next: 'main',
        },
      ],
    },

    delivery: {
      message: 'What do you need help with during delivery?',
      options: [
        {
          id: 'delivery_status',
          label: 'Update delivery status',
          answer:
            'Delivery status can be updated from the delivery order management section.',
          next: 'delivery',
        },
        {
          id: 'customer_location',
          label: 'Customer location',
          answer:
            'Use the customer delivery information shown with the order to reach the correct delivery location.',
          next: 'delivery',
        },
        {
          id: 'delivery_problem',
          label: 'Delivery problem',
          answer:
            'If you cannot complete a delivery, keep the order details available and contact RMA Support.',
          next: 'delivery',
        },
        {
          id: 'delivery_main',
          label: 'Main Menu',
          next: 'main',
        },
      ],
    },

    earnings: {
      message: 'What do you need help with regarding your earnings?',
      options: [
        {
          id: 'earnings',
          label: 'View earnings',
          answer:
            'Your delivery earnings can be viewed from the Earnings section of your Delivery Dashboard.',
          next: 'earnings',
        },
        {
          id: 'earning_issue',
          label: 'Earning issue',
          answer:
            'If an earning appears incorrect, keep the related order details available when contacting RMA Support.',
          next: 'earnings',
        },
        {
          id: 'earnings_main',
          label: 'Main Menu',
          next: 'main',
        },
      ],
    },

    account: {
      message: 'What do you need help with regarding your delivery account?',
      options: [
        {
          id: 'delivery_profile',
          label: 'Profile settings',
          answer:
            'Your delivery profile information can be managed from the Delivery Profile section.',
          next: 'account',
        },
        {
          id: 'delivery_login',
          label: 'Login issue',
          answer:
            'Check your delivery credentials and try logging in again. If the issue continues, contact RMA Support.',
          next: 'account',
        },
        {
          id: 'account_main',
          label: 'Main Menu',
          next: 'main',
        },
      ],
    },

    end: {
      message:
        'Thanks for contacting RMA Support. If you need anything else, you can start a new chat anytime.',
      options: [],
    },
  },

  guest: {
    main: {
      message: 'Hi! Welcome to RMA Support. What can we help you with?',
      options: [
        {
          id: 'guest_rma',
          label: 'About RMA',
          next: 'rma',
        },
        {
          id: 'guest_account',
          label: 'Customer Account',
          next: 'account',
        },
        {
          id: 'guest_orders',
          label: 'Ordering',
          next: 'orders',
        },
        {
          id: 'guest_payment',
          label: 'Payments',
          next: 'payment',
        },
      ],
    },

    rma: {
      message: 'What would you like to know about RMA?',
      options: [
        {
          id: 'what_is_rma',
          label: 'What is RMA?',
          answer:
            'RMA, or Raw Meat Application, helps customers order products from registered local meat shops.',
          next: 'rma',
        },
        {
          id: 'how_rma_works',
          label: 'How does RMA work?',
          answer:
            'Customers can find a participating shop, select products, place an order and track the order through RMA.',
          next: 'rma',
        },
        {
          id: 'become_owner',
          label: 'I want to register my shop',
          answer:
            'Shop owners can use the Owner registration flow to create their RMA shop account.',
          next: 'rma',
        },
        {
          id: 'rma_main',
          label: 'Main Menu',
          next: 'main',
        },
      ],
    },

    account: {
      message: 'What do you need help with regarding your account?',
      options: [
        {
          id: 'create_account',
          label: 'Create an account',
          answer:
            'You can create a customer account through the RMA customer registration page.',
          next: 'account',
        },
        {
          id: 'login',
          label: 'Login',
          answer:
            'Use the RMA login option and enter the credentials associated with your account.',
          next: 'account',
        },
        {
          id: 'account_main',
          label: 'Main Menu',
          next: 'main',
        },
      ],
    },

    orders: {
      message: 'What would you like to know about ordering?',
      options: [
        {
          id: 'find_shop',
          label: 'Find a shop',
          answer:
            'You can use Find Shop to discover participating RMA shops near your location.',
          next: 'orders',
        },
        {
          id: 'place_order',
          label: 'Place an order',
          answer:
            'Select a shop, choose the products you want, add them to your cart and continue through checkout.',
          next: 'orders',
        },
        {
          id: 'track_order',
          label: 'Track an order',
          answer:
            'After placing an order, you can use the Delivery Status page to follow its progress.',
          next: 'orders',
        },
        {
          id: 'orders_main',
          label: 'Main Menu',
          next: 'main',
        },
      ],
    },

    payment: {
      message: 'What do you need help with regarding payment?',
      options: [
        {
          id: 'payment_methods',
          label: 'Payment methods',
          answer: 'Available payment methods are shown during checkout.',
          next: 'payment',
        },
        {
          id: 'payment_failed',
          label: 'Payment failed',
          answer:
            'If a payment fails, check your payment provider before trying the transaction again.',
          next: 'payment',
        },
        {
          id: 'payment_main',
          label: 'Main Menu',
          next: 'main',
        },
      ],
    },

    end: {
      message:
        'Thanks for contacting RMA Support. You can start a new chat anytime.',
      options: [],
    },
  },
};

export default rmaChatData;
