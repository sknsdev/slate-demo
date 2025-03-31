import React from 'react';
import { useSlate } from 'slate-react';
import { Editor as SlateEditor } from 'slate';
import { CustomElement, CustomText } from './Editor';

export const HtmlOutput = () => {
  const editor = useSlate();
  
  const serialize = (value: CustomElement[]) => {
    return value
      .map((n: CustomElement) => {
        if (SlateEditor.isEditor(n)) return '';
        if (n.type === 'paragraph') {
          return `<p>${serializeText(n.children)}</p>`;
        }
        return '';
      })
      .join('');
  };

  const serializeText = (nodes: CustomText[]) => {
    return nodes
      .map((n: CustomText) => {
        let text = n.text;
        if (n.bold) text = `<strong>${text}</strong>`;
        if (n.italic) text = `<em>${text}</em>`;
        if (n.underline) text = `<u>${text}</u>`;
        return text;
      })
      .join('');
  };

  const html = serialize(editor.children as CustomElement[]);

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>HTML Output:</h3>
      <div 
        style={{
          border: '1px solid #ddd',
          padding: '10px',
          background: '#f5f5f5'
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};