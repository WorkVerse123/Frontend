import React from 'react';

// categories: array | string | object
export default function CategoryBadges({ categories, className = '' }) {
  const renderList = (input) => {
    if (input === null || input === undefined || input === '') return null;
    // array
    if (Array.isArray(input)) {
      return input.map((c, i) => (
        <span key={String(c) + i} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs">{(c && (c.name || c.label)) || String(c)}</span>
      ));
    }
    // object
    if (typeof input === 'object') {
      const name = input?.name || input?.label || input?.jobCategory || String(input);
      return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs">{name}</span>;
    }
    // string: try JSON parse
    if (typeof input === 'string') {
      const s = input.trim();
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed.map((c, i) => (
          <span key={String(c) + i} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs">{(c && (c.name || c.label)) || String(c)}</span>
        ));
      } catch (e) {
        // not JSON
      }
      const seps = [',',';','|','/','•',' - '];
      for (const sep of seps) {
        if (s.includes(sep)) return s.split(sep).map((c, i) => (
          <span key={String(c) + i} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs">{c.trim()}</span>
        ));
      }
      const words = s.match(/([A-Z]{2,}|[A-Z][a-z]+)/g);
      if (words && words.length > 1) return words.map((w, i) => (
        <span key={w + i} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs">{w}</span>
      ));
      return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs">{s}</span>;
    }
    return null;
  };

  const content = renderList(categories);
  if (!content) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {content}
    </div>
  );
}
