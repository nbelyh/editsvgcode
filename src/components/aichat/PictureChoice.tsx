import type { ImageStyle } from '../../lib/models';
import { PictureStyleOptions } from './PictureStyleOptions';

interface PictureChoiceProps {
  /** What a redraw by the image model costs, at the image model the user has picked. */
  illustrationCredits: number;
  /** The picked image model redraws in its own way rather than keeping the likeness. */
  likenessHint: boolean;
  /** How an illustration will be drawn. */
  imageStyle: ImageStyle;
  onImageStyleChange: (value: ImageStyle) => void;
  onTrace: () => void;
  onIllustrate: () => void;
  onClose: () => void;
}

/**
 * The question asked when a picture is sent without a message — the only question: whatever
 * is chosen here runs without asking again.
 *
 * It used to offer "Redraw with AI" at the chat model's price, and the chat model then asked
 * for the image model on top — two questions, the first with the wrong price. So the card
 * names the results instead, each at what it costs: an illustration, redrawn by the image
 * model in flat colours and traced, recognisably the same picture; or a trace, the picture
 * copied exactly as many small shapes, free and in the browser. Anything else — a logo drawn
 * as a few clean shapes, say — is a message to write, and the picture goes with it.
 *
 * Every sentence is whole, so each can be translated as written.
 */
export function PictureChoice({ illustrationCredits, likenessHint, imageStyle, onImageStyleChange, onTrace, onIllustrate, onClose }: PictureChoiceProps) {
  return (
    <div className="aui-image-confirm aui-picture-choice">
      <div className="aui-image-confirm-text">What should I do with this picture?</div>
      <div className="aui-image-confirm-hint">
        An illustration is redrawn by the image model in flat colours, then traced; it suits characters, scenes and photos. Tracing copies the picture exactly, as many small shapes. Or write a message to say what you want, such as a logo drawn as a few clean shapes.
      </div>
      {/* With the explanation, before the choices: under the buttons it read as a note on them. */}
      {likenessHint && (
        <div className="aui-image-confirm-hint">For a closer likeness, pick gpt-image-1.5 in the model menu. It keeps faces and details that the selected image model redraws in its own way.</div>
      )}
      {/* Named for what it changes: tracing draws nothing, so it has no style. */}
      <PictureStyleOptions value={imageStyle} onChange={onImageStyleChange} label="Illustration:" />
      <div className="aui-image-confirm-actions">
        {/* The redraw leads: it is the one that keeps a detailed picture recognisable and still
            gives clean shapes. Tracing is the free fallback. */}
        <button className="aui-action-btn aui-action-btn-primary" onClick={onIllustrate}>
          {`Redraw as an illustration (${illustrationCredits} credits)`}
        </button>
        <button className="aui-action-btn" onClick={onTrace}>Trace to SVG (free)</button>
        <button className="aui-action-btn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
