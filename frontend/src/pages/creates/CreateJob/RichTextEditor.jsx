import React, { lazy, Suspense } from 'react';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = lazy(() => import('react-quill'));

export default function RichTextEditor({ value = '', onChange, placeholder = '', readOnly = false }) {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean'],
    ],
  };

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'blockquote',
    'code-block',
    'link',
    'image',
  ];

  return (
    <div className="richtext">
      {readOnly ? (
        <div className="ql-snow">
          <div className="ql-editor" dangerouslySetInnerHTML={{ __html: value || '' }} />
        </div>
      ) : (
        <Suspense fallback={<div>Đang tải trình soạn thảo...</div>}>
          <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
          />
        </Suspense>
      )}
    </div>
  );
}
