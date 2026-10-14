import type { ImageStyle } from '../../lib/models';
import { PictureStyleOptions } from './PictureStyleOptions';

interface ImageConfirmProps {
  summary: string;
  /** What generating or changing the picture costs, at the image model the user has picked. */
  imageCredits: number;
  onConfirm: () => void;
  onDecline: () => void;
  /** How the picture will be drawn, chosen here. */
  imageStyle: ImageStyle;
  onImageStyleChange: (value: ImageStyle) => void;
  /** The prompt as a text box, for a picture asked for in a link (AiChat's picture request):
   *  the user words it, as on the MCP widget's card. Otherwise it is the chat model's summary. */
  onPromptChange?: (prompt: string) => void;
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
export function ImageConfirm({ summary, imageCredits, onConfirm, onDecline, imageStyle, onImageStyleChange, onPromptChange }: ImageConfirmProps) {
  const kind = summary.startsWith('modify:') ? 'modify' : summary.startsWith('picture:') ? 'picture' : 'generate';
  const displaySummary = kind === 'generate' ? summary : summary.slice(kind.length + 1);
  return (
    <div className="aui-image-confirm">
      <div className="aui-image-confirm-text">
        {kind === 'modify' ? 'Change the generated picture?' : kind === 'picture' ? 'Redraw your picture with the image model?' : 'This looks like a picture. Generate it?'}
      </div>
      {onPromptChange ? (
        <textarea
          className="aui-image-confirm-prompt"
          value={displaySummary}
          rows={3}
          aria-label="Prompt"
          onChange={(e) => onPromptChange(e.currentTarget.value)}
        />
      ) : displaySummary && <div className="aui-image-confirm-summary">{displaySummary}</div>}
      <div className="aui-image-confirm-hint">
        {kind === 'modify'
          ? 'The picture is edited and traced into SVG shapes again, so it stays editable. Changing the shapes by hand instead suits small changes, not new details.'
          : kind === 'picture'
            ? 'The image model works from your picture, and the result is traced into SVG shapes you can edit. Drawn by hand with shapes instead, it will be much simpler.'
            : 'A generated picture is traced into SVG shapes, so you can edit it like any other drawing. Drawn by hand with shapes instead, it will be much simpler.'}
      </div>
      <PictureStyleOptions value={imageStyle} onChange={onImageStyleChange} />
      <div className="aui-image-confirm-actions">
        <button className="aui-action-btn aui-action-btn-primary" onClick={onConfirm} disabled={!!onPromptChange && !displaySummary.trim()}>
          {kind === 'modify' ? `Change picture (${imageCredits} credits)` : kind === 'picture' ? `Redraw picture (${imageCredits} credits)` : `Generate picture (${imageCredits} credits)`}
        </button>
        <button className="aui-action-btn" onClick={onDecline}>
          {kind === 'modify' ? 'Edit the shapes instead (no extra credits)' : 'Draw it with shapes instead (no extra credits)'}
        </button>
      </div>
    </div>
  );
}
