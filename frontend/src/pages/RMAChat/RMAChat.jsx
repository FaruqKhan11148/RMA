import './RMAChat.css';

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useUserRole from '../../hooks/useUserRole';
import rmaChatData from './rmaChatData';

function RMAChat() {
  const navigate = useNavigate();

  const { role, loading } = useUserRole();

  const [messages, setMessages] = useState([]);
  const [currentNode, setCurrentNode] = useState('main');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (loading || !role) {
      return;
    }

    const roleChatData = rmaChatData[role];

    if (!roleChatData) {
      return;
    }

    const node = roleChatData.main;

    if (!node) {
      return;
    }

    setMessages([
      {
        id: Date.now(),
        type: 'rma',
        text: node.message,
      },
    ]);
  }, [loading, role]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, isTyping]);

  const endChat = () => {
    navigate(-1);
  };

  const addRmaMessage = (text) => {
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: Date.now() + Math.random(),
        type: 'rma',
        text,
      },
    ]);
  };

  const addCustomerMessage = (text) => {
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: Date.now() + Math.random(),
        type: 'customer',
        text,
      },
    ]);
  };

  const showNextNode = (nodeId) => {
    const roleChatData = rmaChatData[role];

    if (!roleChatData) {
      return;
    }

    const node = roleChatData[nodeId];

    if (!node) {
      return;
    }

    setCurrentNode(nodeId);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      addRmaMessage(node.message);
    }, 700);
  };

  const handleOptionClick = (option) => {
    addCustomerMessage(option.label);

    if (option.next === 'end') {
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);

        const roleChatData = rmaChatData[role];

        if (roleChatData?.end) {
          addRmaMessage(roleChatData.end.message);
        }
      }, 700);

      return;
    }

    if (option.answer) {
      setIsTyping(true);

      setTimeout(() => {
        addRmaMessage(option.answer);

        if (option.next) {
          const roleChatData = rmaChatData[role];
          const nextNode = roleChatData?.[option.next];

          if (!nextNode) {
            setIsTyping(false);
            return;
          }

          setTimeout(() => {
            setCurrentNode(option.next);
            setIsTyping(false);
            addRmaMessage(nextNode.message);
          }, 400);

          return;
        }

        setIsTyping(false);
      }, 700);

      return;
    }

    if (option.next) {
      showNextNode(option.next);
    }
  };

  const currentNodeData = role ? rmaChatData[role]?.[currentNode] : null;

  if (loading || !role) {
    return (
      <main className="rma_chat">
        <header className="rma_chat_header">
          <button
            type="button"
            className="rma_chat_back"
            onClick={endChat}
            aria-label="Go back"
          >
            ‹
          </button>

          <div className="rma_chat_header_info">
            <div className="rma_chat_logo">R</div>

            <div>
              <h1>Chat with RMA</h1>
              <span>RMA Help</span>
            </div>
          </div>

          <button type="button" className="rma_chat_end" onClick={endChat}>
            End
          </button>
        </header>

        <section className="rma_chat_messages">
          <div className="rma_chat_message rma_chat_message_rma">
            <div className="rma_chat_typing">
              <span />
              <span />
              <span />
            </div>
          </div>

          <div ref={messagesEndRef} />
        </section>
      </main>
    );
  }

  return (
    <main className="rma_chat">
      <header className="rma_chat_header">
        <button
          type="button"
          className="rma_chat_back"
          onClick={endChat}
          aria-label="Go back"
        >
          ‹
        </button>

        <div className="rma_chat_header_info">
          <div className="rma_chat_logo">R</div>

          <div>
            <h1>Chat with RMA</h1>
            <span>RMA Help</span>
          </div>
        </div>

        <button type="button" className="rma_chat_end" onClick={endChat}>
          End
        </button>
      </header>

      <section className="rma_chat_messages">
        <div className="rma_chat_welcome">
          <span>RMA Help</span>
          <p>Choose an option below and we'll guide you through it.</p>
        </div>

        {messages.map((message) => (
          <div
            key={message.id}
            className={`rma_chat_message ${
              message.type === 'customer'
                ? 'rma_chat_message_customer'
                : 'rma_chat_message_rma'
            }`}
          >
            <div className="rma_chat_bubble">{message.text}</div>
          </div>
        ))}

        {isTyping && (
          <div className="rma_chat_message rma_chat_message_rma">
            <div className="rma_chat_typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </section>

      {!isTyping && currentNodeData && currentNodeData.options.length > 0 && (
        <div className="rma_chat_options">
          <div className="rma_chat_options_inner">
            {currentNodeData.options.map((option) => (
              <button
                key={option.id}
                type="button"
                className="rma_chat_option"
                onClick={() => handleOptionClick(option)}
              >
                {option.label}
              </button>
            ))}

            <button
              type="button"
              className="rma_chat_option rma_chat_end_option"
              onClick={endChat}
            >
              End Chat
            </button>
          </div>
        </div>
      )}

      {!isTyping && currentNode === 'end' && (
        <div className="rma_chat_options">
          <div className="rma_chat_options_inner">
            <button
              type="button"
              className="rma_chat_option rma_chat_home_option"
              onClick={endChat}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default RMAChat;
