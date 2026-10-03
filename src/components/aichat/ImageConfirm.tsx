interface ImageConfirmProps {
  summary: string;
  /** What generating or changing the picture costs, at the image model the user has picked. */
  imageCredits: number;
  onConfirm: () => void;
  onDecline: () => void;
}

/**
 * The question asked before a picture is generated or changed.
 *
 * It used to read "I'd like to generate an image and vectorize it to SVG … (uses extra
 * credits)" with a choice of "Yes, generate image" or "No, use SVG code", and a third of the
 * people asked chose No — on a site called SVG Code Editor, "use SVG code" sounds like the
 * right answer. Nothing said that a generated picture ends up as SVG too, or what either choice
 * cost. Declining then got them a hand-drawn attempt at a detailed picture, which they rejected.
 *
 * So it says what each choice gives and costs. Declining costs nothing more: the request was
 * already paid for, and drawing by hand is part of the same turn. Generating costs the image
 * model's price on top.
 *
 * Every sentence is whole — generate and modify each have their own, never a shared opening
 * with a varying ending — so each can be translated as written.
 */
export function ImageConfirm({ summary, imageCredits, onConfirm, onDecline }: ImageConfirmProps) {
  const isModify = summary.startsWith('modify:');
  const displaySummary = isModify ? summary.slice('modify:'.length) : summary;
  return (
    <div className="aui-image-confirm">
      <div className="aui-image-confirm-text">
        {isModify ? 'Change the generated picture?' : 'This looks like a picture. Generate it?'}
      </div>
      {displaySummary && <div className="aui-image-confirm-summary">{displaySummary}</div>}
      <div className="aui-image-confirm-hint">
        {isModify
          ? 'The picture is edited and traced into SVG shapes again, so it stays editable. Changing the shapes by hand instead suits small changes, not new details.'
          : 'A generated picture is traced into SVG shapes, so you can edit it like any other drawing. Drawn by hand with shapes instead, it will be much simpler.'}
      </div>
      <div className="aui-image-confirm-actions">
        <button className="aui-action-btn aui-action-btn-primary" onClick={onConfirm}>
          {isModify ? `Change picture (${imageCredits} credits)` : `Generate picture (${imageCredits} credits)`}
        </button>
        <button className="aui-action-btn" onClick={onDecline}>
          {isModify ? 'Edit the shapes instead (no extra credits)' : 'Draw it with shapes instead (no extra credits)'}
        </button>
      </div>
    </div>
  );
}
