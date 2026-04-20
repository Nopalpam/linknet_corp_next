'use client';

import React, { useCallback, useState } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';

// =============================================================================
// TOOLBAR BUTTON
// =============================================================================

interface ToolbarBtnProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarBtn({ onClick, isActive, disabled, title, children }: ToolbarBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors text-xs leading-none ${
        isActive
          ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-0.5" />;
}

// =============================================================================
// TOOLBAR
// =============================================================================

function EditorToolbar({ editor }: { editor: Editor }) {
  const [showSourceCode, setShowSourceCode] = useState(false);
  const [sourceHtml, setSourceHtml] = useState('');

  const addLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('Image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const toggleSource = useCallback(() => {
    if (!showSourceCode) {
      setSourceHtml(editor.getHTML());
      setShowSourceCode(true);
    } else {
      editor.commands.setContent(sourceHtml, { emitUpdate: false });
      setShowSourceCode(false);
    }
  }, [editor, showSourceCode, sourceHtml]);

  if (showSourceCode) {
    return (
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-2 py-1 bg-gray-50 dark:bg-gray-800/60">
          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">HTML Source</span>
          <button
            type="button"
            onClick={toggleSource}
            className="text-[11px] px-2 py-1 rounded bg-brand-600 text-white hover:bg-brand-700 transition-colors font-medium"
          >
            Apply & Close
          </button>
        </div>
        <textarea
          className="w-full px-3 py-2 text-xs font-mono bg-gray-900 text-green-400 border-0 focus:ring-0 resize-y"
          style={{ minHeight: '150px' }}
          value={sourceHtml}
          onChange={(e) => setSourceHtml(e.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
      {/* Heading Dropdown */}
      <select
        className="text-xs px-1.5 py-1 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-brand-500"
        value={
          editor.isActive('heading', { level: 1 }) ? 'h1' :
          editor.isActive('heading', { level: 2 }) ? 'h2' :
          editor.isActive('heading', { level: 3 }) ? 'h3' :
          editor.isActive('heading', { level: 4 }) ? 'h4' : 'p'
        }
        onChange={(e) => {
          const val = e.target.value;
          if (val === 'p') {
            editor.chain().focus().setParagraph().run();
          } else {
            const level = parseInt(val.replace('h', '')) as 1 | 2 | 3 | 4;
            editor.chain().focus().toggleHeading({ level }).run();
          }
        }}
      >
        <option value="p">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="h4">Heading 4</option>
      </select>

      <ToolbarDivider />

      {/* Inline Formatting */}
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
        <strong>B</strong>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
        <em>I</em>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline">
        <span className="underline">U</span>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough">
        <span className="line-through">S</span>
      </ToolbarBtn>

      <ToolbarDivider />

      {/* Text Color */}
      <div className="relative flex items-center" title="Text Color">
        <span className="text-[10px] text-gray-500 dark:text-gray-400 mr-0.5">A</span>
        <input
          type="color"
          className="w-5 h-5 p-0 border-0 rounded cursor-pointer"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          title="Text Color"
        />
      </div>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} title="Highlight">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M15.243 4.515l-6.738 6.737-.707 2.121-1.04 1.041 2.828 2.829 1.04-1.041 2.122-.707 6.737-6.738-4.242-4.242zm6.364 3.535a1 1 0 010 1.414l-7.778 7.778-2.122.707L10 19.656l-1.414 1.414-4.243-4.243L5.757 15.414 7.172 13.999l.707-2.121 7.778-7.778a1 1 0 011.414 0l4.536 4.536zM4.929 19.071l-1.414-1.414a1 1 0 00-1.414 1.414l1.414 1.414a1 1 0 101.414-1.414z"/></svg>
      </ToolbarBtn>

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M3 6h18M3 12h12M3 18h18" /></svg>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M3 6h18M6 12h12M3 18h18" /></svg>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M3 6h18M9 12h12M3 18h18" /></svg>
      </ToolbarBtn>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered List">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M10 6h11M10 12h11M10 18h11M3 5l2 1V4M3 11h2l-2 2M3 18h2l-1-1" /></svg>
      </ToolbarBtn>

      <ToolbarDivider />

      {/* Insert */}
      <ToolbarBtn onClick={addLink} isActive={editor.isActive('link')} title="Insert Link">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
      </ToolbarBtn>
      <ToolbarBtn onClick={addImage} title="Insert Image">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/></svg>
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        title="Insert Table"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M3 10h18M3 14h18M10 3v18M14 3v18M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z" /></svg>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Line">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M3 12h18" /></svg>
      </ToolbarBtn>

      <ToolbarDivider />

      {/* Source Code */}
      <ToolbarBtn onClick={toggleSource} title="Source Code">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
      </ToolbarBtn>

      {/* Undo / Redo */}
      <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l4-4M3 10l4 4" /></svg>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M21 10H11a5 5 0 00-5 5v2M21 10l-4-4M21 10l-4 4" /></svg>
      </ToolbarBtn>
    </div>
  );
}

// =============================================================================
// TABLE TOOLBAR (contextual)
// =============================================================================

function TableToolbarMenu({ editor }: { editor: Editor }) {
  if (!editor.isActive('table')) return null;
  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1 border-b border-gray-200 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/20">
      <span className="text-[10px] font-bold text-yellow-700 dark:text-yellow-400 mr-1">TABLE:</span>
      <ToolbarBtn onClick={() => editor.chain().focus().addColumnBefore().run()} title="Add Column Before">
        <span className="text-[10px]">+Col←</span>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add Column After">
        <span className="text-[10px]">+Col→</span>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete Column">
        <span className="text-[10px] text-red-500">-Col</span>
      </ToolbarBtn>
      <ToolbarDivider />
      <ToolbarBtn onClick={() => editor.chain().focus().addRowBefore().run()} title="Add Row Before">
        <span className="text-[10px]">+Row↑</span>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row After">
        <span className="text-[10px]">+Row↓</span>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().deleteRow().run()} title="Delete Row">
        <span className="text-[10px] text-red-500">-Row</span>
      </ToolbarBtn>
      <ToolbarDivider />
      <ToolbarBtn onClick={() => editor.chain().focus().mergeCells().run()} title="Merge Cells">
        <span className="text-[10px]">Merge</span>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().splitCell().run()} title="Split Cell">
        <span className="text-[10px]">Split</span>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table">
        <span className="text-[10px] text-red-500">Delete</span>
      </ToolbarBtn>
    </div>
  );
}

// =============================================================================
// MAIN WRAPPER
// =============================================================================

interface CKEditorWrapperProps {
  value: string;
  onChange: (data: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
}

const CKEditorWrapper: React.FC<CKEditorWrapperProps> = ({
  value,
  onChange,
  label,
  placeholder,
  minHeight = '200px',
  disabled = false,
}) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, autolink: true, defaultProtocol: 'https' }),
      Image.configure({ inline: false, allowBase64: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: false }),
      Placeholder.configure({ placeholder: placeholder || 'Enter content here...' }),
    ],
    content: value || '',
    editable: !disabled,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none px-4 py-3',
        style: `min-height: ${minHeight}`,
      },
    },
  });

  if (!editor) {
    return <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />;
  }

  return (
    <div className="tiptap-wrapper">
      {label && (
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition-colors bg-white dark:bg-gray-800">
        <EditorToolbar editor={editor} />
        <TableToolbarMenu editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default CKEditorWrapper;
