const rmaChatData = {
  main: {
    message: 'Hi! How can we help you today?',
    options: [
      {
        id: 'order',
        label: 'I have an issue with my order',
        next: 'order',
      },
      {
        id: 'payment',
        label: 'Payment problem',
        next: 'payment',
      },
      {
        id: 'refund',
        label: 'Refund problem',
        next: 'refund',
      },
      {
        id: 'delivery',
        label: 'Delivery problem',
        next: 'delivery',
      },
      {
        id: 'shop',
        label: 'Shop or product problem',
        next: 'shop',
      },
      {
        id: 'account',
        label: 'Account problem',
        next: 'account',
      },
    ],
  },

  order: {
    message: 'What problem are you facing with your order?',
    options: [
      {
        id: 'order_status',
        label: 'I want to check my order status',
        answer:
          'You can check your latest order status from the Orders section. Open the order to view its current status and delivery progress.',
        next: 'order_status_followup',
      },
      {
        id: 'order_not_received',
        label: 'My order has not arrived',
        answer:
          'Please open your order from the Orders section and check its current status. If the order is marked as Out For Delivery, please allow some time for the delivery partner to reach you.',
        next: 'order_followup',
      },
      {
        id: 'order_cancel',
        label: 'I want to cancel my order',
        answer:
          'Order cancellation depends on the current order status. If cancellation is available, you will see the cancellation option on the order.',
        next: 'order_followup',
      },
      {
        id: 'wrong_order',
        label: 'I received the wrong order',
        answer:
          'Please keep the order details available and contact RMA support with your order ID so we can check the issue.',
        next: 'order_followup',
      },
      {
        id: 'order_main',
        label: 'Main Menu',
        next: 'main',
      },
    ],
  },

  order_status_followup: {
    message: 'Is there anything else you would like help with?',
    options: [
      {
        id: 'order_again',
        label: 'I have another order question',
        next: 'order',
      },
      {
        id: 'payment',
        label: 'Payment problem',
        next: 'payment',
      },
      {
        id: 'delivery',
        label: 'Delivery problem',
        next: 'delivery',
      },
      {
        id: 'main',
        label: 'Main Menu',
        next: 'main',
      },
    ],
  },

  order_followup: {
    message: 'Is there anything else you would like help with?',
    options: [
      {
        id: 'order_again',
        label: 'Another order problem',
        next: 'order',
      },
      {
        id: 'refund',
        label: 'Refund problem',
        next: 'refund',
      },
      {
        id: 'main',
        label: 'Main Menu',
        next: 'main',
      },
    ],
  },

  payment: {
    message: 'What payment problem are you facing?',
    options: [
      {
        id: 'payment_failed',
        label: 'My payment failed',
        answer:
          'If your payment failed, please check whether the amount was actually deducted from your bank account. If the amount was not deducted, you can try placing the payment again.',
        next: 'payment_followup',
      },
      {
        id: 'payment_deducted',
        label: 'Money was deducted but order was not confirmed',
        answer:
          'Please do not make another payment immediately. First check your Orders section. If the payment was deducted but the order was not confirmed, the payment may be processed or refunded automatically.',
        next: 'payment_followup',
      },
      {
        id: 'payment_method',
        label: 'What payment methods are supported?',
        answer:
          'RMA currently uses online payment through the available payment options shown during checkout.',
        next: 'payment_followup',
      },
      {
        id: 'payment_main',
        label: 'Main Menu',
        next: 'main',
      },
    ],
  },

  payment_followup: {
    message: 'Did you get the answer you were looking for?',
    options: [
      {
        id: 'yes',
        label: 'Yes, I got my answer',
        next: 'end',
      },
      {
        id: 'payment_again',
        label: 'I have another payment problem',
        next: 'payment',
      },
      {
        id: 'refund',
        label: 'I need help with a refund',
        next: 'refund',
      },
      {
        id: 'main',
        label: 'Main Menu',
        next: 'main',
      },
    ],
  },

  refund: {
    message: 'What refund problem are you facing?',
    options: [
      {
        id: 'refund_status',
        label: 'Where is my refund?',
        answer:
          'Refund processing time can depend on the payment method and banking system. Please check your order payment/refund status first. If the refund has been initiated and you still have not received it, contact RMA support with your order ID.',
        next: 'refund_followup',
      },
      {
        id: 'refund_rejected',
        label: 'My rejected order has not been refunded',
        answer:
          'A rejected order may require refund processing before the amount reaches your original payment method. Please check the refund status associated with your order.',
        next: 'refund_followup',
      },
      {
        id: 'refund_amount',
        label: 'I received the wrong refund amount',
        answer:
          'Please check the refund amount shown in your order details. If the amount does not match the amount that should have been refunded, contact RMA support with your order ID.',
        next: 'refund_followup',
      },
      {
        id: 'refund_main',
        label: 'Main Menu',
        next: 'main',
      },
    ],
  },

  refund_followup: {
    message: 'What would you like to do next?',
    options: [
      {
        id: 'refund_again',
        label: 'Another refund question',
        next: 'refund',
      },
      {
        id: 'payment',
        label: 'Payment problem',
        next: 'payment',
      },
      {
        id: 'main',
        label: 'Main Menu',
        next: 'main',
      },
    ],
  },

  delivery: {
    message: 'What delivery problem are you facing?',
    options: [
      {
        id: 'delivery_late',
        label: 'My delivery is late',
        answer:
          'Please check the delivery status of your order. If the order is Out For Delivery, the delivery partner may still be on the way.',
        next: 'delivery_followup',
      },
      {
        id: 'delivery_address',
        label: 'I entered the wrong address',
        answer:
          'If your order has already been accepted or prepared, changing the delivery address may not be possible. Please check the available options for your order.',
        next: 'delivery_followup',
      },
      {
        id: 'delivery_status',
        label: 'I want to track my delivery',
        answer:
          'Open your order from the Orders section to view its current delivery status.',
        next: 'delivery_followup',
      },
      {
        id: 'delivery_main',
        label: 'Main Menu',
        next: 'main',
      },
    ],
  },

  delivery_followup: {
    message: 'Is there anything else I can help you with?',
    options: [
      {
        id: 'delivery_again',
        label: 'Another delivery problem',
        next: 'delivery',
      },
      {
        id: 'order',
        label: 'Order problem',
        next: 'order',
      },
      {
        id: 'main',
        label: 'Main Menu',
        next: 'main',
      },
    ],
  },

  shop: {
    message: 'What problem are you facing with the shop or product?',
    options: [
      {
        id: 'shop_closed',
        label: 'The shop is closed',
        answer:
          'Shop availability depends on the shop owner settings and operating hours. You can try another available shop from Find Shop.',
        next: 'shop_followup',
      },
      {
        id: 'product_unavailable',
        label: 'The product is unavailable',
        answer:
          'Product availability is controlled by the shop. If a product is unavailable, you can check again later or choose another product.',
        next: 'shop_followup',
      },
      {
        id: 'wrong_product',
        label: 'I received a different product',
        answer:
          'Please keep your order details available and contact RMA support with your order ID so the issue can be checked.',
        next: 'shop_followup',
      },
      {
        id: 'shop_main',
        label: 'Main Menu',
        next: 'main',
      },
    ],
  },

  shop_followup: {
    message: 'What would you like to do next?',
    options: [
      {
        id: 'shop_again',
        label: 'Another shop/product problem',
        next: 'shop',
      },
      {
        id: 'order',
        label: 'Order problem',
        next: 'order',
      },
      {
        id: 'main',
        label: 'Main Menu',
        next: 'main',
      },
    ],
  },

  account: {
    message: 'What account problem are you facing?',
    options: [
      {
        id: 'login',
        label: 'I cannot log in',
        answer:
          'Please check that you are using the correct phone number and password. If the problem continues, try logging in again after refreshing the page.',
        next: 'account_followup',
      },
      {
        id: 'profile',
        label: 'I want to update my profile',
        answer:
          'You can manage your profile information from the Profile section.',
        next: 'account_followup',
      },
      {
        id: 'address',
        label: 'I want to manage my addresses',
        answer:
          'You can add, edit, or manage your saved delivery addresses from Profile → Saved Addresses.',
        next: 'account_followup',
      },
      {
        id: 'account_main',
        label: 'Main Menu',
        next: 'main',
      },
    ],
  },

  account_followup: {
    message: 'Is there anything else you need help with?',
    options: [
      {
        id: 'account_again',
        label: 'Another account problem',
        next: 'account',
      },
      {
        id: 'order',
        label: 'Order problem',
        next: 'order',
      },
      {
        id: 'main',
        label: 'Main Menu',
        next: 'main',
      },
    ],
  },

  end: {
    message: 'Glad we could help! Your RMA chat has ended.',
    options: [],
  },
};

export default rmaChatData;
