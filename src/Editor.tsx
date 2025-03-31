import React, { useMemo, useCallback, forwardRef, useImperativeHandle, useState } from 'react';
import { createEditor, Editor as SlateEditor, Text, Transforms, BaseEditor, Descendant } from 'slate';
import { Slate, Editable, withReact, useSlate, ReactEditor } from 'slate-react';
import { withHistory, HistoryEditor } from 'slate-history';
import { HtmlOutput } from './HtmlOutput';

export type CustomText = { text: string; bold?: boolean; italic?: boolean; underline?: boolean };
export type CustomElement = { type: 'paragraph'; children: CustomText[] };

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'Это базовый редактор на Slate.js' }],
  },
];

export const deserializeHtml = (html: string): Descendant[] => {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const elements: Descendant[] = [];

  parsed.body.childNodes.forEach(node => {
    if (node.nodeName === 'P') {
      const children: CustomText[] = [];
      
      node.childNodes.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          children.push({ text: child.textContent || '' });
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const el = child as HTMLElement;
          const text = el.textContent || '';
          
          if (el.tagName === 'STRONG' || el.tagName === 'B') {
            children.push({ text, bold: true });
          } else if (el.tagName === 'EM' || el.tagName === 'I') {
            children.push({ text, italic: true });
          } else if (el.tagName === 'U') {
            children.push({ text, underline: true });
          } else {
            children.push({ text });
          }
        }
      });

      elements.push({
        type: 'paragraph',
        children,
      });
    }
  });

  return elements.length > 0 ? elements : initialValue;
};

const isFormatActive = (editor: SlateEditor, format: string) => {
  const matches = Array.from(SlateEditor.nodes(editor, {
    match: (n) => Text.isText(n) && n[format as keyof CustomText] === true,
    mode: 'all',
  }));
  return matches.length > 0;
};

const toggleFormat = (editor: SlateEditor, format: string) => {
  const isActive = isFormatActive(editor, format);
  Transforms.setNodes(
    editor,
    { [format]: isActive ? null : true },
    { match: n => Text.isText(n), split: true }
  );
};

const Toolbar = () => {
  const editor = useSlate();
  return (
    <div style={{ marginBottom: '10px' }}>
      <button
        onClick={e => {
          e.preventDefault();
          toggleFormat(editor, 'bold');
        }}
       
      >
        Жирный
      </button>
      <button
        onClick={e => {
          e.preventDefault();
          toggleFormat(editor, 'italic');
        }}
        
      >
        Курсив
      </button>
      <button
        onClick={e => {
          e.preventDefault();
          toggleFormat(editor, 'underline');
        }}
        
      >
        Подчеркнутый
      </button>
    </div>
  );
};

interface EditorMethods {
  deserializeHtml: (html: string) => Descendant[];
  resetEditor: (value: Descendant[]) => void;
}

export const RichTextEditor = forwardRef<EditorMethods>((props, ref) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [value, setValue] = useState(initialValue);
  
  useImperativeHandle(ref, () => ({
    deserializeHtml,
    resetEditor: (newValue: Descendant[]) => {
      Transforms.delete(editor, {
        at: {
          anchor: SlateEditor.start(editor, []),
          focus: SlateEditor.end(editor, []),
        }
      });
      Transforms.insertNodes(editor, newValue);
      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
      
      setValue(newValue);
    }
  }));

  const renderLeaf = useCallback((props: any) => {
    return (
      <span
        {...props.attributes}
        style={{
          fontWeight: props.leaf.bold ? 'bold' : 'normal',
          fontStyle: props.leaf.italic ? 'italic' : 'normal',
          textDecoration: props.leaf.underline ? 'underline' : 'none',
        }}
      >
        {props.children}
      </span>
    );
  }, []);

  return (
    <Slate editor={editor} initialValue={value} onChange={setValue}>
      <Toolbar />
      <Editable
        renderLeaf={renderLeaf}
        style={{
          border: '1px solid #ddd',
          padding: '10px',
          minHeight: '200px'
        }}
      />
      {/* <HtmlOutput/> */}
    </Slate>
  );
});