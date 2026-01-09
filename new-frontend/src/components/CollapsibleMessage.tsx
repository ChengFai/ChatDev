import { useState, useRef, useEffect } from 'react';

interface CollapsibleMessageProps {
  content: string;
  maxHeight?: number;
  isHtml?: boolean;
}

export default function CollapsibleMessage({
  content,
  maxHeight = 200,
  isHtml = false,
}: CollapsibleMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsCollapse, setNeedsCollapse] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      setNeedsCollapse(contentHeight > maxHeight);
    }
  }, [content, maxHeight]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    alert('Content copied to clipboard!');
  };

  const style: React.CSSProperties = {
    maxHeight: needsCollapse && !isExpanded ? `${maxHeight}px` : 'none',
    overflow: 'hidden',
  };

  return (
    <div className="collapsible-message">
      <div
        ref={contentRef}
        className="collapsible-content"
        style={style}
        dangerouslySetInnerHTML={isHtml ? { __html: content } : undefined}
      >
        {!isHtml && content}
      </div>

      {needsCollapse && (
        <button className="collapsible-toggle" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      )}

      <button className="collapsible-copy" onClick={copyToClipboard} title="Copy to clipboard">
        Copy
      </button>
    </div>
  );
}
