import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import './styles/variables.css';
import './styles/global.css';

import App from './App';

import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <LanguageProvider>
      <CartProvider>
        <OrderProvider>
          <App />
        </OrderProvider>
      </CartProvider>
    </LanguageProvider>
  </React.StrictMode>,
);
