import { type ReactNode } from 'react';
import { Text, Tooltip } from '@mantine/core';
import './FooterLink.css';

export function FooterLink({ href, target, rel, icon, title, children }: { href: string; target?: string; rel?: string; icon?: ReactNode; title?: string; children: ReactNode }) {
  const link = (
    <Text
      component="a"
      href={href}
      target={target}
      rel={rel}
      size="sm"
      c="dimmed"
      className="footer-link"
    >
      {icon}{children}
    </Text>
  );

  if (!title) return link;

  return (
    <Tooltip label={title} withArrow position="top" withinPortal>
      <span>{link}</span>
    </Tooltip>
  );
}
