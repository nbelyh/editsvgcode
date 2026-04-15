import { useState, useEffect } from 'react';
import { Container, Title, Text, Table, Badge, Loader, Group, Anchor, Stack, Paper, Button, SimpleGrid } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { firebaseDb } from '../lib/firebase';
import { buildCheckoutUrl } from '../lib/ppg-checkout';

interface Transaction {
  orderId: string;
  type: string;
  sku: string | null;
  amount: string | null;
  currency: string | null;
  date: string | null;
  subscriptionId: string | null;
  testMode: boolean;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  subscription_charged:  { label: 'Subscription started', color: 'green' },
  subscription_renewed:  { label: 'Renewal',              color: 'blue' },
  subscription_refunded: { label: 'Refunded',             color: 'red' },
  credits_purchased:     { label: 'Credits purchased',    color: 'teal' },
  credits_refunded:      { label: 'Credits refunded',     color: 'red' },
};

function TypeBadge({ type }: { type: string }) {
  const meta = TYPE_LABELS[type] ?? { label: type, color: 'gray' };
  return <Badge color={meta.color} variant="light" size="sm">{meta.label}</Badge>;
}

export function BillingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u && !u.isAnonymous) {
        try {
          const q = query(
            collection(firebaseDb, 'users', u.uid, 'transactions'),
            orderBy('createdAt', 'desc')
          );
          const snap = await getDocs(q);
          setTransactions(snap.docs.map((d) => ({ orderId: d.id, ...d.data() } as Transaction)));
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
  }, []);

  if (loading) {
    return <Container size="sm" py="xl"><Loader size="sm" /></Container>;
  }

  if (!user || user.isAnonymous) {
    return (
      <Container size="sm" py="xl">
        <Title order={2} mb="md">Billing</Title>
        <Text c="dimmed">Sign in to view your billing history.</Text>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Title order={2} mb="md">Billing</Title>

      <Paper withBorder p="md" mb="xl" radius="md">
        <Stack gap="xs">
          <Title order={5}>Upgrade or top up</Title>
          <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm" mt="xs">
            <Button
              component="a"
              href={buildCheckoutUrl('pro-monthly', { uid: user.uid, email: user.email, displayName: user.displayName })}
              target="_blank" rel="noopener noreferrer"
              variant="filled" size="sm"
            >
              Pro Monthly — $10/mo
            </Button>
            <Button
              component="a"
              href={buildCheckoutUrl('pro-annual', { uid: user.uid, email: user.email, displayName: user.displayName })}
              target="_blank" rel="noopener noreferrer"
              variant="light" size="sm"
            >
              Pro Annual — $80/yr
            </Button>
            <Button
              component="a"
              href={buildCheckoutUrl('credits-300', { uid: user.uid, email: user.email, displayName: user.displayName })}
              target="_blank" rel="noopener noreferrer"
              variant="default" size="sm"
            >
              300 Credits — $10
            </Button>
            <Button
              component="a"
              href={buildCheckoutUrl('credits-1000', { uid: user.uid, email: user.email, displayName: user.displayName })}
              target="_blank" rel="noopener noreferrer"
              variant="default" size="sm"
            >
              1,000 Credits — $15
            </Button>
          </SimpleGrid>
        </Stack>
      </Paper>

      <Paper withBorder p="md" mb="xl" radius="md">
        <Stack gap="xs">
          <Title order={5}>Manage subscription</Title>
          <Text size="sm" c="dimmed">
            To cancel, update payment details, or download invoices, visit the PayPro Global customer portal.
          </Text>
          <Group mt="xs">
            <Button
              component="a"
              href="https://store.payproglobal.com/customer/account/login"
              target="_blank"
              rel="noopener noreferrer"
              variant="default"
              size="sm"
              rightSection={<IconExternalLink size={14} />}
            >
              PayPro Global portal
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Title order={4} mb="sm">Transaction history</Title>

      {transactions.length === 0 ? (
        <Text c="dimmed" size="sm">No transactions yet.</Text>
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Order</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {transactions.map((t) => (
              <Table.Tr key={t.orderId}>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {t.date ? new Date(t.date).toLocaleDateString() : '—'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap={6}>
                    <TypeBadge type={t.type} />
                    {t.testMode && <Badge color="yellow" variant="outline" size="xs">test</Badge>}
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {t.amount && t.currency ? `${t.currency} ${t.amount}` : '—'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Anchor
                    href={`https://cc.payproglobal.com/Orders/Details/${t.orderId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                  >
                    #{t.orderId}
                  </Anchor>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Container>
  );
}
