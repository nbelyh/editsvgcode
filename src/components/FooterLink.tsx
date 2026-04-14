import { type ReactNode } from 'react';
import { Text } from '@mantine/core';
import './FooterLink.css';

export function FooterLink({ href, target, rel, icon, children }: { href: string; target?: string; rel?: string; icon?: ReactNode; children: ReactNode }) {
  return (
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
}
