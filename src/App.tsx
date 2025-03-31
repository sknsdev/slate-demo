import React, { useState, useRef } from 'react';
import { Descendant } from 'slate';
import './App.css';
import { RichTextEditor } from './Editor';
import { HtmlOutput } from './HtmlOutput';

function App() {
  const [htmlInput, setHtmlInput] = useState(
    '<p>Пример <strong>HTML</strong> для импорта. <em>Попробуйте</em> изменить текст</p>'
  );
  const editorRef = useRef<{ deserializeHtml: (html: string) => Descendant[]; resetEditor: (value: Descendant[]) => void }>(null);

  const handleImport = () => {
    try {
      console.log('htmlInput:', htmlInput);
      if (editorRef.current && htmlInput) {
        const value = editorRef.current.deserializeHtml(htmlInput);
        console.log('deserializeHtml:', value);
        editorRef.current.resetEditor(value);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ошибка';
      console.error('Import error:', message);
    }
  };

  return (
    <div className="App">
      <h1>Slate.js Demo</h1>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <textarea
            value={htmlInput}
            onChange={(e) => setHtmlInput(e.target.value)}
            placeholder="Введите HTML"
            style={{ width: '100%', minHeight: '60px' }}
          />
          <button onClick={handleImport} style={{ marginTop: '10px' }}>
            Импортировать HTML
          </button>
        </div>
        <RichTextEditor ref={editorRef} />
      </div>
    </div>
  );
}

export default App;
