import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import './RichTextRenderer.css';

interface RichTextRendererProps {
  content: JSONContent;
  className?: string;
}

export function RichTextRenderer({ content, className = '' }: RichTextRendererProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content,
    editable: false,
  });

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  if (!content) return null;

  return <EditorContent editor={editor} className={`prose max-w-none ${className} px-4 sm:px-0`} />;
}

export default RichTextRenderer;
