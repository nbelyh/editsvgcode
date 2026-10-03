import { Fragment, memo, useMemo, useState } from 'react';
import { Anchor, Tooltip, Popover, Radio, Text, Stack } from '@mantine/core';
import { EDIT_MODELS, IMAGE_MODELS, groupModels, shortModelName, visibleEditModels, type ModelOption } from '../../lib/models';
import type { ReasoningEffort } from './types';

/** "gpt-5.4-mini · 3" — credits dimmed so the model name stays the thing you scan. */
function modelLabel(m: ModelOption) {
  return (
    <>
      {m.label} <Text span size="xs" c="dimmed">· {m.credits}</Text>
    </>
  );
}

interface ModelPickerProps {
  model: string;
  onModelChange: (value: string) => void;
  imageModel: string;
  onImageModelChange: (value: string) => void;
  effort: ReasoningEffort | undefined;
  supportedEfforts: ReasoningEffort[] | undefined;
  onEffortChange: (value: ReasoningEffort) => void;
  isModelDisabled: (m: { pro: boolean }) => boolean;
}

/**
 * The model summary under the composer and the popover that changes it.
 *
 * Its own memoized component because the composer re-renders on every
 * keystroke and nothing here depends on the draft. Kept mounted (below), the
 * dropdown is a Radio and a Tooltip per model, and re-rendering all of that per
 * character was a large part of what made typing slow on phones. The memo only
 * holds while the composer passes stable props — e2e/composer-typing.spec.ts
 * fails if one stops being stable.
 */
export const ModelPicker = memo(function ModelPicker({
  model, onModelChange, imageModel, onImageModelChange,
  effort, supportedEfforts, onEffortChange, isModelDisabled,
}: ModelPickerProps) {
  const [showAllModels, setShowAllModels] = useState(false);
  const editModels = useMemo(
    () => (showAllModels ? EDIT_MODELS : visibleEditModels(model)),
    [showAllModels, model],
  );

  return (
    // keepMounted for the same reason as the nav drawer in App.tsx: the
    // dropdown is a Radio and a Tooltip per model, and mounting all of that
    // cold inside the tap cost 136ms at 4x CPU throttling, almost all of it in
    // the animation frame Mantine renders the content on. display-none rather
    // than the default activity mode: activity pre-renders but holds every
    // effect back until the first open, and with a Floating UI instance per
    // Tooltip those effects were most of what the tap still paid for.
    <Popover position="top-start" shadow="md" keepMounted keepMountedMode="display-none">
      <Popover.Target>
        {/* A real <button>: Popover.Target puts aria-haspopup and aria-expanded on
            whatever it wraps, and a <p> supports neither — which axe reports as an
            unsupported-ARIA failure. It also could not be reached by keyboard. */}
        <Text
          component="button"
          type="button"
          aria-label="Models in use — click to change"
          size="xs"
          c="dimmed"
          style={{ cursor: 'pointer', whiteSpace: 'nowrap', background: 'none', border: 0, padding: 0 }}
        >
          {shortModelName(model)}{effort ? ` · ${effort}` : ''} · {shortModelName(imageModel)}
        </Text>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap="md">
          <div>
            <Text size="xs" fw={600} mb={4}>Edit model</Text>
            <Radio.Group value={model} onChange={onModelChange}>
              <Stack gap={4}>
                {groupModels(editModels).map((group, gi) => (
                  <Fragment key={group.title}>
                    <Text size="xs" c="dimmed" fw={600} mt={gi === 0 ? 0 : 6}>{group.title}</Text>
                    {group.models.map(m => (
                      <Tooltip key={m.value} label="Pro subscription required" disabled={!isModelDisabled(m)} position="right">
                        <div><Radio value={m.value} label={modelLabel(m)} size="xs" disabled={isModelDisabled(m)} /></div>
                      </Tooltip>
                    ))}
                  </Fragment>
                ))}
              </Stack>
            </Radio.Group>
            <Anchor component="button" type="button" size="xs" mt={6} onClick={() => setShowAllModels(v => !v)}>
              {showAllModels ? 'Show fewer' : `Show all ${EDIT_MODELS.length} models…`}
            </Anchor>
          </div>
          {supportedEfforts && (
            <div>
              <Text size="xs" fw={600} mb={4}>Thinking effort</Text>
              <Radio.Group value={effort ?? 'high'} onChange={v => onEffortChange(v as ReasoningEffort)}>
                <Stack gap={4}>
                  {supportedEfforts.map(e => (
                    <Radio key={e} value={e} label={e[0].toUpperCase() + e.slice(1)} size="xs" />
                  ))}
                </Stack>
              </Radio.Group>
            </div>
          )}
          <div>
            <Text size="xs" fw={600} mb={4}>Image model</Text>
            <Radio.Group value={imageModel} onChange={onImageModelChange}>
              <Stack gap={4}>
                {IMAGE_MODELS.map(m => (
                  <Tooltip key={m.value} label="Pro subscription required" disabled={!isModelDisabled(m)} position="right">
                    <div><Radio value={m.value} label={modelLabel(m)} size="xs" disabled={isModelDisabled(m)} /></div>
                  </Tooltip>
                ))}
              </Stack>
            </Radio.Group>
          </div>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
});
