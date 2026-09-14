import { useEffect } from 'react';

import './FlashMessage.css';

function FlashMessage({ message, onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) {
    return null;
  }

  return <div className="flash_message">{message}</div>;
}

export default FlashMessage;
