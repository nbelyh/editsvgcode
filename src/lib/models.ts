export interface ModelOption {
  label: string;
  value: string;
  /** Credits per request. Must match MODEL_CONFIG in the API — the server is
   *  authoritative and will charge its own number regardless of what is shown here. */
  credits: number;
  pro: boolean;
  efforts?: ReasoningEffort[];
  defaultEffort?: ReasoningEffort;
  /** Kept working but collapsed behind "Show all" in the picker. Set on models that
   *  cost the user the same credits as a strictly newer sibling, so there is no
   *  reason to pick them — see the one-per-price-point list below. */
  hidden?: boolean;
}

export type ReasoningEffort = 'low' | 'medium' | 'high' | 'xhigh' | 'max';

const EFFORTS_LMH: ReasoningEffort[] = ['low', 'medium', 'high'];
const EFFORTS_LMHX: ReasoningEffort[] = ['low', 'medium', 'high', 'xhigh'];
// 'max' reasons above 'xhigh' and is only offered by the gpt-5.6 tiers.
const EFFORTS_LMHXM: ReasoningEffort[] = ['low', 'medium', 'high', 'xhigh', 'max'];

/** Ordered by credit cost so the picker reads as a price ladder. Within a price point,
 *  a model is hidden when a same-priced sibling from the same family strictly supersedes
 *  it — there is no reason to pick the older one. Models from different families can
 *  both stay visible at one price point (gpt-5.4-mini and Kimi-K2.6 at 3x), since
 *  neither supersedes the other.
 *
 *  Every entry here must have a matching Azure deployment (the model string IS the
 *  deployment name). Models with no deployment were removed rather than hidden —
 *  offering them, even behind "Show all", only produces runtime errors.
 *
 *  Third-party models (DeepSeek, Kimi) go through the same Responses API and call
 *  SVG_TOOLS fine, but reject `reasoning.effort` with a 400 — hence no `efforts`
 *  here, and `reasoning: false` in the server's MODEL_CONFIG. */
export const EDIT_MODELS: ModelOption[] = [
  // --- Free tier ---
  { label: 'gpt-4.1-mini', value: 'gpt-4.1-mini', credits: 1, pro: false, hidden: true },
  { label: 'DeepSeek-V4-Flash', value: 'DeepSeek-V4-Flash', credits: 1, pro: false, hidden: true },
  { label: 'gpt-5.4-nano', value: 'gpt-5.4-nano', credits: 1, pro: false, efforts: EFFORTS_LMH, defaultEffort: 'high' },
  { label: 'gpt-5-mini', value: 'gpt-5-mini', credits: 3, pro: false, efforts: EFFORTS_LMH, defaultEffort: 'high', hidden: true },
  { label: 'gpt-5.4-mini', value: 'gpt-5.4-mini', credits: 3, pro: false, efforts: EFFORTS_LMHX, defaultEffort: 'high' },
  { label: 'Kimi-K2.6', value: 'Kimi-K2.6', credits: 3, pro: false },
  // --- Pro ---
  { label: 'gpt-5.6-luna', value: 'gpt-5.6-luna', credits: 8, pro: true, efforts: EFFORTS_LMHXM, defaultEffort: 'high' },
  { label: 'gpt-5.4', value: 'gpt-5.4', credits: 20, pro: true, efforts: EFFORTS_LMHX, defaultEffort: 'high', hidden: true },
  { label: 'gpt-5.6-terra', value: 'gpt-5.6-terra', credits: 20, pro: true, efforts: EFFORTS_LMHXM, defaultEffort: 'high' },
  { label: 'gpt-5.6-sol', value: 'gpt-5.6-sol', credits: 40, pro: true, efforts: EFFORTS_LMHXM, defaultEffort: 'high' },
];

/** Split a model list into the two groups the picker renders. Free first, since free
 *  users can act on it; ascending credits within each group. */
export function groupModels(models: ModelOption[]): { title: string; models: ModelOption[] }[] {
  return [
    { title: 'Free', models: models.filter(m => !m.pro) },
    { title: 'Pro', models: models.filter(m => m.pro) },
  ].filter(g => g.models.length > 0);
}

/** The picker's default set: every visible model, plus `selected` when it is a hidden
 *  one, so a saved choice never disappears from the list it is checked in. */
export function visibleEditModels(selected: string): ModelOption[] {
  return EDIT_MODELS.filter(m => !m.hidden || m.value === selected);
}

/**
 * Model behind the publish dialog's "Suggest with AI". Must stay in step with
 * META_MODEL in the API's suggest-meta function — the server picks the model,
 * this only tells the user what it will cost.
 */
export const GALLERY_META_MODEL = 'gpt-4.1-mini';
export const GALLERY_META_CREDITS =
  EDIT_MODELS.find((m) => m.value === GALLERY_META_MODEL)?.credits ?? 1;

export const DEFAULT_EDIT_MODEL = 'gpt-5.4-mini';
export const DEFAULT_IMAGE_MODEL = 'gpt-image-1-mini';

/** Map a persisted model choice onto a model that still exists.
 *  Retired models (e.g. gpt-5) linger in localStorage long after removal; without
 *  this the picker renders blank and no reasoning effort is sent. */
export function resolveEditModel(value: string | null): string {
  return EDIT_MODELS.some(m => m.value === value) ? value! : DEFAULT_EDIT_MODEL;
}

export function resolveImageModel(value: string | null): string {
  return IMAGE_MODELS.some(m => m.value === value) ? value! : DEFAULT_IMAGE_MODEL;
}

export const IMAGE_MODELS: ModelOption[] = [
  { label: 'gpt-image-1-mini', value: 'gpt-image-1-mini', credits: 10, pro: false },
  { label: 'gpt-image-1.5', value: 'gpt-image-1.5', credits: 30, pro: true },
  // Kept despite costing the most: the only image model with working transparency.
  { label: 'gpt-image-1', value: 'gpt-image-1', credits: 50, pro: true },
];

export function shortModelName(value: string): string {
  return value.replace('gpt-', '').replace('image-', 'img');
}
