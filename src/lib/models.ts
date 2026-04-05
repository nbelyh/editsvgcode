export interface ModelOption {
  label: string;
  value: string;
  pro: boolean;
}

export const EDIT_MODELS: ModelOption[] = [
  { label: 'gpt-4o-mini (1x)', value: 'gpt-4o-mini', pro: false },
  { label: 'gpt-4.1-mini (1x)', value: 'gpt-4.1-mini', pro: false },
  { label: 'gpt-5-mini (3x)', value: 'gpt-5-mini', pro: false },
  { label: 'gpt-5.1-codex-mini (3x)', value: 'gpt-5.1-codex-mini', pro: false },
  { label: 'gpt-5.4-mini (3x)', value: 'gpt-5.4-mini', pro: false },
  { label: 'gpt-4.1 (5x)', value: 'gpt-4.1', pro: true },
  { label: 'gpt-5 (15x)', value: 'gpt-5', pro: true },
  { label: 'gpt-5.1 (15x)', value: 'gpt-5.1', pro: true },
  { label: 'gpt-5.1-codex (15x)', value: 'gpt-5.1-codex', pro: true },
  { label: 'gpt-5.2 (20x)', value: 'gpt-5.2', pro: true },
  { label: 'gpt-5.2-codex (20x)', value: 'gpt-5.2-codex', pro: true },
  { label: 'gpt-5.4 (20x)', value: 'gpt-5.4', pro: true },
];

export const IMAGE_MODELS: ModelOption[] = [
  { label: 'gpt-image-1-mini (10x)', value: 'gpt-image-1-mini', pro: false },
  { label: 'gpt-image-1.5 (30x)', value: 'gpt-image-1.5', pro: true },
  { label: 'gpt-image-1 (50x)', value: 'gpt-image-1', pro: true },
];

export function shortModelName(value: string): string {
  return value.replace('gpt-', '').replace('image-', 'img');
}
