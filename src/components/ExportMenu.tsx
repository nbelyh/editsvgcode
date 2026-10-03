import { useState } from 'react';
import { Button, Menu } from '@mantine/core';
import { IconDownload, IconChevronDown, IconPhoto, IconCode, IconFileTypeSvg, IconApps } from '@tabler/icons-react';
import { ExportImageModal } from './ExportImageModal';
import { CopyCodeModal } from './CopyCodeModal';
import { IconSetModal } from './IconSetModal';

/**
 * Download, and everything else the drawing can be turned into.
 *
 * One Download button that opens every choice: the .svg itself first, then the drawing as a
 * picture, as site icons, and as code in the shapes people paste it into — a data URI for an
 * <img>, a CSS background, a React component. Each kind is one item; the panel it opens holds the
 * variants, so the menu stays short enough to read at a glance. A split button kept the .svg one click away, but
 * nobody found the arrow beside it; a whole-button menu shows the choices to everyone who
 * downloads, at the cost of one more click for the .svg — which is why it comes first.
 *
 * The picture, the icons and the code each open a panel that shows the result before it is saved or
 * copied, so nothing reaches a file or the clipboard unseen.
 */

interface ExportMenuProps {
  svg: string;
  fileName: string;
  /** A real name for the drawing, for naming a React component — never a generated id. Empty when there is none. */
  codeName: string;
  onDownload: () => void;
}

export function ExportMenu({ svg, fileName, codeName, onDownload }: ExportMenuProps) {
  const [imageOpen, setImageOpen] = useState(false);
  const [iconsOpen, setIconsOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);

  return (
    <>
      <Menu position="bottom-start" shadow="md" withinPortal>
        <Menu.Target>
          <Button variant="subtle" color="gray" size="compact-xs" leftSection={<IconDownload size={14} />} rightSection={<IconChevronDown size={12} />}>
            Download
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item leftSection={<IconFileTypeSvg size={14} />} onClick={onDownload}>SVG file</Menu.Item>
          <Menu.Item leftSection={<IconPhoto size={14} />} onClick={() => setImageOpen(true)}>Image (PNG, WebP)…</Menu.Item>
          <Menu.Item leftSection={<IconApps size={14} />} onClick={() => setIconsOpen(true)}>Favicon and app icons…</Menu.Item>
          <Menu.Item leftSection={<IconCode size={14} />} onClick={() => setCodeOpen(true)}>Code (data URI, CSS, React)…</Menu.Item>
        </Menu.Dropdown>
      </Menu>
      <ExportImageModal opened={imageOpen} onClose={() => setImageOpen(false)} svg={svg} fileName={fileName} />
      <IconSetModal opened={iconsOpen} onClose={() => setIconsOpen(false)} svg={svg} fileName={fileName} />
      <CopyCodeModal opened={codeOpen} onClose={() => setCodeOpen(false)} svg={svg} fileName={codeName} />
    </>
  );
}
