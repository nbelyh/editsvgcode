interface ImageConfirmProps {
  summary: string;
  onConfirm: () => void;
  onDecline: () => void;
}

export function ImageConfirm({ summary, onConfirm, onDecline }: ImageConfirmProps) {
  const isModify = summary.startsWith('modify:');
  const displaySummary = isModify ? summary.slice('modify:'.length) : summary;
  return (
    <div className="aui-image-confirm">
      <div className="aui-image-confirm-text">
        {isModify
          ? <>I'd like to modify the generated image and re-vectorize it to SVG: {displaySummary}</>
          : <>I'd like to generate an image and vectorize it to SVG: {displaySummary}</>}
      </div>
      <div className="aui-image-confirm-hint">
        {isModify
          ? 'This will edit the previously generated raster image with your requested changes, then re-vectorize it (uses extra credits).'
          : 'Generating produces much better results for illustrations, characters, and complex artwork (uses extra credits). Drawing manually with SVG code will likely produce poor results for complex images.'}
      </div>
      <div className="aui-image-confirm-actions">
        <button className="aui-action-btn aui-action-btn-primary" onClick={onConfirm}>
          {isModify ? 'Yes, modify image' : 'Yes, generate image'}
        </button>
        <button className="aui-action-btn" onClick={onDecline}>No, use SVG code</button>
      </div>
    </div>
  );
}
