import React, { useState, useRef, useEffect } from 'react';
import ApiEndpoints from '../../../services/ApiEndpoints';
import { post as apiPost } from '../../../services/ApiClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import CandidateProfileModal from '../../candidates/CandidateProfileModal';

function generateAIResponse(userText) {
  // Simple deterministic mock response logic. Replace with API call when ready.
  if (!userText || userText.trim().length === 0) return "Xin chào! Bạn cần mình giúp gì?";
  const t = userText.toLowerCase();
  if (t.includes('lương') || t.includes('tiền')) return 'Mức lương phụ thuộc vào vị trí và kinh nghiệm. Bạn muốn mình ước lượng theo ngành nào?';
  if (t.includes('ứng tuyển') || t.includes('apply')) return 'Để ứng tuyển, bạn có thể nhấn nút "Ứng tuyển" trên trang tin tuyển dụng và điền thông tin của bạn.';
  if (t.endsWith('?')) return 'Đó là một câu hỏi hay — để mình suy nghĩ..., nhưng hiện tại mình chưa có câu trả lời chính xác cho bạn.';
  return `Tôi không thể đưa ra câu trả lời dựa trên câu "${userText}" của bạn.`;
}

export default function AIChatWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  // chat only allowed for logged-in premium users
  const parseBool = (v) => {
    if (v === true || v === 1) return true;
    if (v === false || v === 0) return false;
    if (typeof v === 'string') {
      const s = v.trim().toLowerCase();
      if (s === 'true' || s === '1') return true;
      if (s === 'false' || s === '0') return false;
    }
    return null;
  };

  const hasPremiumFlag = () => {
    if (!user) return false;
    const candidates = [user.isPremium, user.IsPremium, user.premium, user.is_premium];
    // also try nested token
    if (user.token) candidates.push(user.token.isPremium, user.token.IsPremium, user.token.is_premium, user.token.premium);
    for (const c of candidates) {
      const p = parseBool(c);
      if (p === true) return true;
    }
    return false;
  };

  const chatAllowed = Boolean(user && hasPremiumFlag());
  const [openCandidate, setOpenCandidate] = useState(false);
  const [activeCandidateId, setActiveCandidateId] = useState(null);

  // simple analytics/log function - replace with real service if available
  const logAnalytics = (event, payload) => {
    try {
      // TODO: replace with real analytics service call
      // analytics integration goes here
    } catch (e) {
      // swallow
    }
  };
  const [open, setOpen] = useState(false);
  const [showDisabledNotice, setShowDisabledNotice] = useState(false);
  // keep track of the storage key we use so we can clear it on logout
  const storageKeyRef = useRef(null);

  const getUserKey = (u) => {
    if (!u) return 'guest';
    return String(u.id ?? u.userId ?? u.user_id ?? u.email ?? 'user');
  };

  const getStorageKey = (u) => `ai_chat_messages_${getUserKey(u)}`;

  const [messages, setMessages] = useState(() => {
    try {
      const key = getStorageKey(user);
      let raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
      // fallback: if nothing stored for this user, try guest key (useful if history was saved before login)
      const guestRaw = localStorage.getItem(getStorageKey(null));
      if (guestRaw) return JSON.parse(guestRaw);
    } catch (e) {
      // ignore
    }
    return [{ from: 'ai', text: 'Xin chào! Tôi là trợ lý AI. Hỏi tôi về tìm việc, nhà tuyển dụng hoặc quy trình ứng tuyển.' }];
  });
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  // ensure storageKeyRef always has a key (including guest) to avoid accidental clears
  useEffect(() => {
    try {
      if (!storageKeyRef.current) storageKeyRef.current = getStorageKey(user);
    } catch (e) {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  // hide disabled notice after a short delay
  useEffect(() => {
    if (!showDisabledNotice) return;
    const t = setTimeout(() => setShowDisabledNotice(false), 3000);
    return () => clearTimeout(t);
  }, [showDisabledNotice]);

  // if chat becomes disallowed while open, close it
  useEffect(() => {
    if (!chatAllowed && open) setOpen(false);
  }, [chatAllowed, open]);

  // persist messages to localStorage when they change
  useEffect(() => {
    try {
      const key = storageKeyRef.current || getStorageKey(user);
      storageKeyRef.current = key;
      localStorage.setItem(key, JSON.stringify(messages));
    } catch (e) {
      // ignore storage errors
    }
  }, [messages, user]);

  // clear stored history only when user transitions from logged-in -> logged-out
  const prevUserRef = useRef(user);
  useEffect(() => {
    const wasLoggedIn = !!prevUserRef.current;
    const isLoggedIn = !!user;
    if (wasLoggedIn && !isLoggedIn) {
      try {
        const prevKey = storageKeyRef.current || getStorageKey(prevUserRef.current);
        if (prevKey) localStorage.removeItem(prevKey);
        storageKeyRef.current = null;
      } catch (e) {
        // ignore
      }
    }
    prevUserRef.current = user;
  }, [user]);

  // when the chat panel is opened, reload the persisted history (useful after reload or in another tab)
  useEffect(() => {
    if (!open) return;
    try {
      const key = getStorageKey(user);
      storageKeyRef.current = key;
      let raw = localStorage.getItem(key);
      if (!raw) raw = localStorage.getItem(getStorageKey(null)); // fallback to guest
      if (raw) {
        const stored = JSON.parse(raw);
        // only update if stored is an array (valid messages)
        if (Array.isArray(stored)) setMessages(stored);
      }
    } catch (e) {
      // ignore JSON/storage errors
    }
  }, [open, user]);

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

      // process reply: could be string, JSON-string, or object with suggestions
      const processed = processReply(reply);
      setMessages(prev => [...prev, { from: 'ai', ...processed }]);
    } catch (e) {
      // on any failure fallback to mock
      const reply = generateAIResponse(text);
      const processed = processReply(reply);
      setMessages(prev => [...prev, { from: 'ai', ...processed }]);
    } finally {
      setSending(false);
    }
  };

  // Render text preserving newlines, convert markdown-like bullets to <ul>
  // and handle simple markdown: **bold**, *italic*, `code`
  const renderFormattedText = (text) => {
    if (!text && text !== '') return null;
    if (typeof text !== 'string') return String(text);

    // Split into lines and detect bullet lines starting with '* '
    const lines = text.split(/\r?\n/);
  const elements = [];
    let buffer = [];

    const renderInlineMarkdown = (t) => {
      if (!t) return t;
      // simple replacements: code, bold, italic
      // handle inline code first
      const parts = [];
      let remaining = t;
      const codeRegex = /`([^`]+)`/;
      while (true) {
        const m = remaining.match(codeRegex);
        if (!m) break;
        const before = remaining.slice(0, m.index);
        if (before) parts.push(before);
        parts.push(<code className="bg-slate-100 px-1 rounded text-xs" key={`code-${parts.length}`}>{m[1]}</code>);
        remaining = remaining.slice(m.index + m[0].length);
      }
      if (remaining) parts.push(remaining);

      // now handle bold and italic inside string parts
      return parts.map((p, i) => {
        if (typeof p !== 'string') return <span key={`p-${i}`}>{p}</span>;
        // bold **text**
        const boldItalicProcessed = [];
        let s = p;
        const boldRegex = /\*\*([^*]+)\*\*/g;
        let lastIndex = 0;
        let match;
        while ((match = boldRegex.exec(s)) !== null) {
          if (match.index > lastIndex) boldItalicProcessed.push(s.slice(lastIndex, match.index));
          boldItalicProcessed.push(<strong key={`b-${i}-${lastIndex}`}>{match[1]}</strong>);
          lastIndex = match.index + match[0].length;
        }
        if (lastIndex < s.length) boldItalicProcessed.push(s.slice(lastIndex));

        // now handle *italic* inside resulting strings
        return <span key={`p-${i}`}>{boldItalicProcessed.map((part, idx) => {
          if (typeof part !== 'string') return <span key={idx}>{part}</span>;
          const italicParts = [];
          const italicRegex = /\*([^*]+)\*/g;
          let li = 0;
          let m2;
          let lastI = 0;
          while ((m2 = italicRegex.exec(part)) !== null) {
            if (m2.index > lastI) italicParts.push(part.slice(lastI, m2.index));
            italicParts.push(<em key={`i-${idx}-${li}`}>{m2[1]}</em>);
            lastI = m2.index + m2[0].length;
            li++;
          }
          if (lastI < part.length) italicParts.push(part.slice(lastI));
          return italicParts.map((p2, k) => <span key={`${idx}-${k}`}>{p2}</span>);
        })}</span>;
      });
    };

    const flushBufferAsParagraph = () => {
      if (buffer.length === 0) return;
      const textContent = buffer.join(' ');
      elements.push(<p className="mb-1" key={`p-${elements.length}`}>{renderInlineMarkdown(textContent)}</p>);
      buffer = [];
    };

    const flushBullets = (bullets) => {
      if (bullets.length === 0) return;
      elements.push(
        <ul className="list-disc list-inside text-sm mb-1" key={`ul-${elements.length}`}>
          {bullets.map((b, i) => <li key={`li-${i}`}>{renderInlineMarkdown(b)}</li>)}
        </ul>
      );
    };

    let bullets = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('* ')) {
        // flush any pending paragraph buffer
        flushBufferAsParagraph();
        bullets.push(trimmed.substring(2).trim());
      } else {
        if (bullets.length > 0) {
          flushBullets(bullets);
          bullets = [];
        }
        if (trimmed === '') {
          // blank line -> flush paragraph
          flushBufferAsParagraph();
        } else {
          buffer.push(trimmed);
        }
      }
    }

    if (bullets.length > 0) flushBullets(bullets);
    flushBufferAsParagraph();

    return <div>{elements.length ? elements : <span>{text}</span>}</div>;
  };
  // Normalize various reply shapes into { text, suggestions }
  const processReply = (reply) => {
    let obj = reply;
    // if it's a JSON string, try parse
    if (typeof reply === 'string') {
      const trimmed = reply.trim();
      if ((trimmed.startsWith('{') || trimmed.startsWith('['))) {
        try {
          obj = JSON.parse(trimmed);
        } catch (err) {
          obj = reply; // keep string
        }
      }
    }

    // default response shape
    const result = { text: '', suggestions: null };

    if (typeof obj === 'string') {
      result.text = obj;
      return result;
    }

    // if it's an array of suggestion-like items
    if (Array.isArray(obj)) {
      result.text = '';
      result.suggestions = obj.map(normalizeSuggestion).filter(Boolean);
      if (result.suggestions.length === 0) result.suggestions = null;
      return result;
    }

    // object
    result.text = obj.text || obj.message || obj.reply || '';

    const suggestions = [];
    // common keys that might contain job/candidate suggestions
    const tryCollect = (key, type) => {
      const val = obj[key];
      if (!val) return;
      if (Array.isArray(val)) val.forEach(v => suggestions.push({ type, ...normalizeSuggestion(v) }));
      else suggestions.push({ type, ...normalizeSuggestion(val) });
    };

    tryCollect('jobs', 'job');
    tryCollect('job', 'job');
    tryCollect('jobDetail', 'job');
    tryCollect('candidates', 'candidate');
    tryCollect('candidate', 'candidate');
    tryCollect('people', 'candidate');
    // fallback: a generic suggestions array
    if (Array.isArray(obj.suggestions)) {
      obj.suggestions.forEach(s => suggestions.push(normalizeSuggestion(s)));
    }

    // normalize collected suggestions into {type,id,title}
    const normalized = suggestions.map(s => {
      // if s already normalized
      if (s && s.type && s.id) return { type: s.type || 'job', id: String(s.id), title: s.title || s.name || s.label || '' };
      if (s && s.id) return { type: s.type || 'job', id: String(s.id), title: s.title || s.name || '' };
      return null;
    }).filter(Boolean);

    result.suggestions = normalized.length ? normalized : null;
    return result;
  };

  const normalizeSuggestion = (item) => {
    if (!item) return null;
    if (typeof item === 'string') {
      // maybe it's "job:123:Title" or "candidate:45:Nguyen"
      const parts = item.split(':');
      if (parts.length >= 3) {
        const t = parts[0].toLowerCase().includes('cand') ? 'candidate' : (parts[0].toLowerCase().includes('job') ? 'job' : 'job');
        return { type: t, id: parts[1], title: parts.slice(2).join(':') };
      }
      return { title: item };
    }
    // object
      // prefer common job id fields including camelCase jobId
      const idVal = item.jobId ?? item.job_id ?? item.id ?? item._id ?? item.candidate_id ?? item.user_id ?? item.employee_id;
      const titleVal = item.title || item.name || item.fullName || item.label || item.jobTitle || item.displayName || '';
      let typeVal = item.type || null;
      if (!typeVal) {
        // if it looks like a job object, prefer 'job'
        if (idVal != null && (item.title || item.jobId || item.job_id || item.jobTitle)) typeVal = 'job';
        // fallback: if candidate-specific fields present, mark as candidate
        else if (item.candidate_id || item.employee_id || item.fullName) typeVal = 'candidate';
      }
      return {
        id: idVal != null ? String(idVal) : undefined,
        title: titleVal,
        type: typeVal
      };
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
                    <div className="text-sm">
                      {renderFormattedText(m.text)}
                    </div>
                    {/* render suggestion tags when present */}
                    {m.suggestions && Array.isArray(m.suggestions) && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {m.suggestions.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              if (!s || !s.id) return;
                              // analytics
                              logAnalytics('ai_suggestion_click', { type: s.type, id: s.id, title: s.title });
                              if (s.type === 'candidate') {
                                setActiveCandidateId(s.id);
                                setOpenCandidate(true);
                              } else {
                                // navigate to job detail page
                                logAnalytics('ai_suggestion_navigate', { type: s.type, id: s.id, title: s.title });
                                try {
                                  navigate(`/jobs/${s.id}`);
                                } catch (e) {
                                  // fallback: set window location
                                  window.location.href = `/jobs/${s.id}`;
                                }
                                // ensure navigation happens even if react-router didn't change location
                                setTimeout(() => {
                                  if (window.location.pathname !== `/jobs/${s.id}`) {
                                    window.location.assign(`/jobs/${s.id}`);
                                  }
                                }, 300);
                                // keep chat open after navigation
                              }
                            }}
                            className={`text-xs px-2 py-1 rounded-full border flex items-center gap-2 ${s.type === 'candidate' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-indigo-100 text-indigo-800 border-indigo-200'}`}
                          >
                            {s.type === 'candidate' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a4 4 0 100 8 4 4 0 000-8zM2 18a8 8 0 0116 0H2z" /></svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M6 2a1 1 0 00-1 1v2H3a1 1 0 000 2h2v6a1 1 0 001 1h8a1 1 0 001-1V7h2a1 1 0 100-2h-2V3a1 1 0 00-1-1H6z"/></svg>
                            )}
                            <span>{s.title || (s.type === 'candidate' ? `Ứng viên ${s.id}` : `Công việc ${s.id}`)}</span>
                          </button>
                        ))}
                      </div>
                    )}
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
                  disabled={!chatAllowed || sending || input.trim().length === 0}
                  className="bg-[#2563eb] text-white px-3 py-1 rounded"
                >Gửi</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating button - fixed at bottom-right (hidden when chat not allowed) */}
      {chatAllowed && (
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
      )}
      <CandidateProfileModal
        open={openCandidate}
        onClose={() => { setOpenCandidate(false); setActiveCandidateId(null); }}
        employeeId={activeCandidateId}
      />
    </>
  );
}
