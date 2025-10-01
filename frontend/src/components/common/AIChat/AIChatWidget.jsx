import React, { useState, useRef, useEffect } from 'react';
import ApiEndpoints from '../../../services/ApiEndpoints';
import { post as apiPost } from '../../../services/ApiClient';
import { useAuth } from '../../../contexts/AuthContext';

function generateAIResponse(userText) {
  // Simple deterministic mock response logic. Replace with API call when ready.
  if (!userText || userText.trim().length === 0) return "Xin chào! Bạn cần mình giúp gì?";
  const t = userText.toLowerCase();
  if (t.includes('lương') || t.includes('tiền')) return 'Mức lương phụ thuộc vào vị trí và kinh nghiệm. Bạn muốn mình ước lượng theo ngành nào?';
  if (t.includes('ứng tuyển') || t.includes('apply')) return 'Để ứng tuyển, bạn có thể nhấn nút "Ứng tuyển" trên trang tin tuyển dụng và điền thông tin của bạn.';
  if (t.endsWith('?')) return 'Đó là một câu hỏi hay — để mình suy nghĩ... (đây là phản hồi mô phỏng).';
  return `Tôi đã nhận: "${userText}" — đây là phản hồi mô phỏng.`;
}

export default function AIChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'ai', text: 'Xin chào! Tôi là trợ lý AI. Hỏi tôi về tìm việc, nhà tuyển dụng hoặc quy trình ứng tuyển.' },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { from: 'user', text }]);
    setInput('');
    setSending(true);

    // choose endpoint based on role
    const role = (user && (user.profileType || user.role || user.roleName)) ? String(user.profileType || user.role || user.roleName).toLowerCase() : 'guest';
    const isEmployee = role === 'employee' || role === '4' || role === 'emp' || role === 'employee';
    const isEmployer = role === 'employer' || role === '3' || role === 'employer';

    try {
      // prefer server endpoint when available
      let reply = null;
      if (isEmployee && ApiEndpoints.AI_CHAT_EMPLOYEE) {
        const res = await apiPost(ApiEndpoints.AI_CHAT_EMPLOYEE, { query: text, user: user || null });
        reply = res?.data?.reply || res?.data || res?.reply || null;
      } else if (isEmployer && ApiEndpoints.AI_CHAT_EMPLOYER) {
        const res = await apiPost(ApiEndpoints.AI_CHAT_EMPLOYER, { query: text, user: user || null });
        reply = res?.data?.reply || res?.data || res?.reply || null;
      }

      if (!reply) {
        // fallback to local generator when no server reply
        reply = generateAIResponse(text);
      }

      setMessages(prev => [...prev, { from: 'ai', text: reply }]);
    } catch (e) {
      // on any failure fallback to mock
      const reply = generateAIResponse(text);
      setMessages(prev => [...prev, { from: 'ai', text: reply }]);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Chat panel - fixed independently so it doesn't affect button position */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50">
  <div className="w-80 md:w-96 h-[30rem] bg-white shadow-xl rounded-xl flex flex-col overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="font-semibold text-sm">Trợ lý AI</div>
              <div className="flex items-center gap-2">
                <button
                  aria-label="Đóng chat"
                  className="text-sm text-slate-600 px-2 py-1 hover:bg-slate-100 rounded"
                  onClick={() => setOpen(false)}
                >Đóng</button>
              </div>
            </div>

            <div ref={listRef} className="flex-1 overflow-auto p-3 space-y-2 bg-[#f8fafc]">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'ai' ? 'justify-start' : 'justify-end'}`}>
                  <div className={m.from === 'ai'
                    ? 'text-sm inline-block bg-white text-slate-800 px-3 py-2 rounded-lg shadow max-w-[80%]'
                    : 'text-sm text-white inline-block bg-[#2563eb] px-3 py-2 rounded-lg max-w-[80%] text-right'
                  }>
                    {m.text}
                  </div>
                </div>
              ))}
              {sending && <div className="text-sm text-slate-500">Đang trả lời...</div>}
            </div>

            <div className="p-3 border-t">
              <textarea
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Viết tin nhắn... (Enter gửi)"
                className="w-full border rounded-md px-3 py-2 text-sm resize-none"
              />
              <div className="mt-2 flex items-center justify-end">
                <button
                  onClick={send}
                  disabled={sending || input.trim().length === 0}
                  className="bg-[#2563eb] text-white px-3 py-1 rounded"
                >Gửi</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating button - fixed at bottom-right */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setOpen(v => !v)}
          aria-label="Mở chat AI"
          title="Trợ lý AI"
          className="w-14 h-14 rounded-full bg-[#2563eb] shadow-xl flex items-center justify-center text-white hover:scale-105 transition overflow-hidden"
        >
          <img src="/image/WorkVerseLogoCycle 1.png" alt="WorkVerse" className="h-8 w-8 object-contain" />
        </button>
      </div>
    </>
  );
}
