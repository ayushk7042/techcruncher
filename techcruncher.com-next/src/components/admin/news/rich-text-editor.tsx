"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  CodeXml,
  Italic,
  Library,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  SquareCode,
  Strikethrough,
  Undo2,
  Unlink,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MediaPicker, mediaToImage } from "@/components/admin/image-field";
import { useToast } from "@/components/admin/toast";
import { Spinner } from "@/components/admin/ui";
import { adminApi } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import type { ImageAsset } from "@/types/api";
import { IconButton, iconButtonClass } from "../controls";

type BlockType = "paragraph" | "h2" | "h3";

const normalizeHref = (href: string) => (/^(https?:|mailto:|tel:|\/|#)/i.test(href) ? href : `https://${href}`);

function useToolbarState(editor: Editor | null) {
  return useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      block: (current?.isActive("heading", { level: 2 })
        ? "h2"
        : current?.isActive("heading", { level: 3 })
          ? "h3"
          : "paragraph") as BlockType,
      bold: Boolean(current?.isActive("bold")),
      italic: Boolean(current?.isActive("italic")),
      strike: Boolean(current?.isActive("strike")),
      blockquote: Boolean(current?.isActive("blockquote")),
      bulletList: Boolean(current?.isActive("bulletList")),
      orderedList: Boolean(current?.isActive("orderedList")),
      codeBlock: Boolean(current?.isActive("codeBlock")),
      link: Boolean(current?.isActive("link")),
      canUndo: Boolean(current?.can().undo()),
      canRedo: Boolean(current?.can().redo()),
    }),
  });
}

/**
 * Tiptap editor that emits HTML. The HTML view edits the raw string directly
 * and does not round-trip it through the editor schema, so markup the editor
 * does not model (tables, embeds) survives a save.
 */
export function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const [initialContent] = useState(value);
  const [htmlMode, setHtmlMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: false }),
      Link.configure({ openOnClick: false, autolink: true, defaultProtocol: "https" }),
      Image,
    ],
    content: initialContent,
    editorProps: { attributes: { class: "article-body", "aria-label": "Article body" } },
    onUpdate: ({ editor: current }) => onChangeRef.current(current.getHTML()),
  });

  const state = useToolbarState(editor);
  const disabled = !editor || htmlMode;

  const setBlock = (block: BlockType) => {
    const chain = editor?.chain().focus();
    if (block === "paragraph") chain?.setParagraph().run();
    else chain?.setHeading({ level: block === "h2" ? 2 : 3 }).run();
  };

  const editLink = () => {
    if (!editor) return;
    const previous: unknown = editor.getAttributes("link").href;
    const input = window.prompt("Link URL (leave empty to remove the link)", typeof previous === "string" ? previous : "https://");
    if (input === null) return;
    const chain = editor.chain().focus().extendMarkRange("link");
    if (input.trim()) chain.setLink({ href: normalizeHref(input.trim()) }).run();
    else chain.unsetLink().run();
  };

  const insertImages = (images: ImageAsset[]) => {
    images.forEach((image) => {
      if (image.url) editor?.chain().focus().setImage({ src: image.url, alt: image.alt || "" }).run();
    });
  };

  async function upload(file: File) {
    setUploading(true);
    try {
      const { data } = await adminApi.uploadMedia(file, { folder: "articles" });
      insertImages([mediaToImage(data)]);
    } catch (error) {
      toast.error(errorMessage(error, "Upload failed"));
    } finally {
      setUploading(false);
    }
  }

  const toggleHtml = () => {
    // entering rich mode re-parses the raw HTML without reporting a change
    if (htmlMode) editor?.commands.setContent(value, { emitUpdate: false });
    setHtmlMode(!htmlMode);
  };

  return (
    <section className="adm-card">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2">
        <h2 className="eyebrow text-ink">Body</h2>
        <button type="button" onClick={toggleHtml} aria-pressed={htmlMode} className={cn("adm-btn adm-btn-sm", htmlMode && "border-ink")}>
          <CodeXml className="h-3 w-3" aria-hidden="true" />
          {htmlMode ? "Visual editor" : "HTML"}
        </button>
      </div>

      <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5 border-b border-line px-2 py-1.5">
        <select
          aria-label="Block type"
          className="adm-select mr-1 h-7 w-[120px] text-[12px]"
          disabled={disabled}
          value={state?.block ?? "paragraph"}
          onChange={(event) => setBlock(event.target.value as BlockType)}
        >
          <option value="paragraph">Paragraph</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>
        <IconButton label="Bold" icon={Bold} disabled={disabled} pressed={state?.bold} onClick={() => editor?.chain().focus().toggleBold().run()} />
        <IconButton label="Italic" icon={Italic} disabled={disabled} pressed={state?.italic} onClick={() => editor?.chain().focus().toggleItalic().run()} />
        <IconButton
          label="Strikethrough"
          icon={Strikethrough}
          disabled={disabled}
          pressed={state?.strike}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
        />
        <span aria-hidden="true" className="mx-1 h-5 w-px bg-line" />
        <IconButton
          label="Quote"
          icon={Quote}
          disabled={disabled}
          pressed={state?.blockquote}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        />
        <IconButton
          label="Bullet list"
          icon={List}
          disabled={disabled}
          pressed={state?.bulletList}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        />
        <IconButton
          label="Numbered list"
          icon={ListOrdered}
          disabled={disabled}
          pressed={state?.orderedList}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        />
        <IconButton
          label="Code block"
          icon={SquareCode}
          disabled={disabled}
          pressed={state?.codeBlock}
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        />
        <IconButton label="Divider" icon={Minus} disabled={disabled} onClick={() => editor?.chain().focus().setHorizontalRule().run()} />
        <span aria-hidden="true" className="mx-1 h-5 w-px bg-line" />
        <IconButton label={state?.link ? "Edit link" : "Add link"} icon={LinkIcon} disabled={disabled} pressed={state?.link} onClick={editLink} />
        <IconButton
          label="Remove link"
          icon={Unlink}
          disabled={disabled || !state?.link}
          onClick={() => editor?.chain().focus().extendMarkRange("link").unsetLink().run()}
        />
        <button
          type="button"
          title="Upload image"
          aria-label="Upload image"
          disabled={disabled || uploading}
          onClick={() => fileRef.current?.click()}
          className={iconButtonClass}
        >
          {uploading ? <Spinner className="h-3.5 w-3.5" /> : <Upload className="h-3.5 w-3.5" aria-hidden="true" />}
        </button>
        <IconButton label="Insert image from library" icon={Library} disabled={disabled} onClick={() => setPickerOpen(true)} />
        <span aria-hidden="true" className="mx-1 h-5 w-px bg-line" />
        <IconButton label="Undo" icon={Undo2} disabled={disabled || !state?.canUndo} onClick={() => editor?.chain().focus().undo().run()} />
        <IconButton label="Redo" icon={Redo2} disabled={disabled || !state?.canRedo} onClick={() => editor?.chain().focus().redo().run()} />
      </div>

      <div className={cn("rte", htmlMode && "hidden")}>
        <EditorContent editor={editor} />
      </div>
      {htmlMode && (
        <textarea
          aria-label="Article HTML"
          spellCheck={false}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="block min-h-[420px] w-full resize-y bg-paper px-5 py-4 font-mono text-[12.5px] leading-relaxed text-ink outline-none"
        />
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload(file);
          event.target.value = "";
        }}
      />
      <MediaPicker multiple open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={(items) => insertImages(items.map(mediaToImage))} />
    </section>
  );
}
