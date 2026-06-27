import React, { useState } from 'react';
import './ChatWidget.css';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="chat-widget-btn"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="chat-widget-icon">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="chat-widget-window">
      {/* Header */}
      <div className="chat-widget-header">
        <div className="chat-widget-header-info">
          <div className="chat-widget-avatar">
            P
          </div>
          <div>
            <h3 className="chat-widget-title">PulseDesk Support</h3>
            <div className="chat-widget-status">
              <span className="chat-widget-status-dot"></span>
              Online — we reply immediately
            </div>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="chat-widget-close">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width: '18px', height: '18px'}}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>

      {/* Chat Area */}
      <div className="chat-widget-body">
        <div className="chat-widget-time">1:57 pm</div>
        
        {/* Message 1 */}
        <div className="chat-widget-message">
          <div className="chat-widget-message-avatar">PS</div>
          <div className="chat-widget-message-bubble">
            Hello! 👋 I'm Prashant from PulseDesk. How can I help you today?
          </div>
        </div>

        {/* Message 2 */}
        <div className="chat-widget-message">
          <div className="chat-widget-message-avatar">PS</div>
          <div className="chat-widget-message-bubble">
            Tell us directly — whatever the issue, I'm here. No question is too big or small.
          </div>
        </div>
      </div>

      {/* Quick Replies */}
      <div className="chat-widget-quick-replies">
        <button className="chat-widget-chip">
          <span className="chat-widget-chip-icon">📦</span> Track an order
        </button>
        <button className="chat-widget-chip">
          <span className="chat-widget-chip-icon">💳</span> Billing issue
        </button>
        <button className="chat-widget-chip">
          <span className="chat-widget-chip-icon">🔧</span> Need technical help
        </button>
      </div>

      {/* Input Area */}
      <div className="chat-widget-input-area">
        <input 
          type="text" 
          placeholder="Type your question here..." 
          className="chat-widget-input"
        />
        <button className="chat-widget-send">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
