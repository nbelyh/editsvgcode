export interface ModelOption {
  label: string;
  value: string;
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

/** Ordered by credit cost so the picker reads as a price ladder. Within a price point
 *  the newest model is listed last and is the only one left visible — the others cost
 *  the user exactly the same for a strictly older model.
 *
 *  Every entry here must have a matching Azure deployment (the model string IS the
 *  deployment name). Models with no deployment were removed rather than hidden —
 *  offering them, even behind "Show all", only produces runtime errors. */
export const EDIT_MODELS: ModelOption[] = [
  // 1x
  { label: 'gpt-4.1-mini (1x)', value: 'gpt-4.1-mini', pro: false, hidden: true },
  { label: 'gpt-5.4-nano (1x)', value: 'gpt-5.4-nano', pro: false, efforts: EFFORTS_LMH, defaultEffort: 'high' },
  // 3x
  { label: 'gpt-5-mini (3x)', value: 'gpt-5-mini', pro: false, efforts: EFFORTS_LMH, defaultEffort: 'high', hidden: true },
  { label: 'gpt-5.4-mini (3x)', value: 'gpt-5.4-mini', pro: false, efforts: EFFORTS_LMHX, defaultEffort: 'high' },
  // 8x
  { label: 'gpt-5.6-luna (8x)', value: 'gpt-5.6-luna', pro: true, efforts: EFFORTS_LMHXM, defaultEffort: 'high' },
  // 20x
  { label: 'gpt-5.4 (20x)', value: 'gpt-5.4', pro: true, efforts: EFFORTS_LMHX, defaultEffort: 'high', hidden: true },
  { label: 'gpt-5.6-terra (20x)', value: 'gpt-5.6-terra', pro: true, efforts: EFFORTS_LMHXM, defaultEffort: 'high' },
  // 40x
  { label: 'gpt-5.6-sol (40x)', value: 'gpt-5.6-sol', pro: true, efforts: EFFORTS_LMHXM, defaultEffort: 'high' },
];

/** The picker's default set: every visible model, plus `selected` when it is a hidden
 *  one, so a saved choice never disappears from the list it is checked in. */
export function visibleEditModels(selected: string): ModelOption[] {
  return EDIT_MODELS.filter(m => !m.hidden || m.value === selected);
}

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
  { label: 'gpt-image-1-mini (10x)', value: 'gpt-image-1-mini', pro: false },
  { label: 'gpt-image-1.5 (30x)', value: 'gpt-image-1.5', pro: true },
  { label: 'gpt-image-1 (50x)', value: 'gpt-image-1', pro: true },
];

export function shortModelName(value: string): string {
  return value.replace('gpt-', '').replace('image-', 'img');
}
