import { useEffect, useRef } from "react";
import { marked } from "marked";

marked.setOptions({ breaks: true, gfm: true });

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = marked.parse(content) as string;
    }
  }, [content]);

  return (
    <div
      ref={ref}
      className="prose-teal h-full overflow-y-auto px-8 py-8"
      style={{ color: "var(--text-primary)", maxWidth: "none" }}
    />
  );
}
