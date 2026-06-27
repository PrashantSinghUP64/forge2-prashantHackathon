import React, { useState } from 'react';
import './index.css';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-all z-50 flex items-center justify-center"
        style={{ width: '60px', height: '60px' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200" style={{ height: '600px', maxHeight: '80vh' }}>
      {/* Header */}
      <div className="bg-slate-700 text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-lg font-semibold shadow-inner">
            P
          </div>
          <div>
            <h3 className="font-semibold text-lg leading-tight">PulseDesk Support</h3>
            <div className="flex items-center text-green-400 text-xs mt-1">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
              Online — we reply immediately
            </div>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white bg-slate-600 hover:bg-slate-500 rounded p-1 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
             <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-slate-50 p-4 overflow-y-auto flex flex-col space-y-4">
        <div className="text-center text-xs text-gray-400 my-2">1:57 pm</div>
        
        {/* Message 1 */}
        <div className="flex items-start space-x-2">
          <div className="w-8 h-8 rounded-full bg-slate-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            PS
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-3 shadow-sm text-sm text-gray-700">
            Hello! 👋 I'm Prashant from PulseDesk. How can I help you today?
          </div>
        </div>

        {/* Message 2 */}
        <div className="flex items-start space-x-2">
          <div className="w-8 h-8 rounded-full bg-slate-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            PS
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-3 shadow-sm text-sm text-gray-700">
            Tell us directly — whatever the issue, I'm here. No question is too big or small.
          </div>
        </div>
      </div>

      {/* Quick Replies */}
      <div className="bg-white px-4 py-3 border-t border-gray-100 flex flex-wrap gap-2">
        <button className="text-xs text-gray-600 bg-white border border-gray-300 rounded-full px-3 py-1.5 hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center shadow-sm">
          <span className="mr-1.5">📦</span> Track an order
        </button>
        <button className="text-xs text-gray-600 bg-white border border-gray-300 rounded-full px-3 py-1.5 hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center shadow-sm">
          <span className="mr-1.5">💳</span> Billing issue
        </button>
        <button className="text-xs text-gray-600 bg-white border border-gray-300 rounded-full px-3 py-1.5 hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center shadow-sm">
          <span className="mr-1.5">🔧</span> Need technical help
        </button>
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-gray-200 flex items-center space-x-2">
        <input 
          type="text" 
          placeholder="Type your question here..." 
          className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        <button className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 -mr-1">
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
