interface ImageConfirmProps {
  summary: string;
  onConfirm: () => void;
  onDecline: () => void;
}

export function ImageConfirm({ summary, onConfirm, onDecline }: ImageConfirmProps) {
  return (
    <div className="aui-image-confirm">
      <div className="aui-image-confirm-text">
        I'd like to generate an image and vectorize it to SVG: {summary}
      </div>
      <div className="aui-image-confirm-hint">
        Generating produces much better results for illustrations, characters, and complex artwork (uses extra credits). Drawing manually with SVG code will likely produce poor results for complex images.
      </div>
      <div className="aui-image-confirm-actions">
        <button className="aui-image-confirm-btn aui-image-confirm-btn-primary" onClick={onConfirm}>Generate &amp; vectorize</button>
        <button className="aui-image-confirm-btn" onClick={onDecline}>Try to draw SVG with code instead</button>
      </div>
    </div>
  );
}
