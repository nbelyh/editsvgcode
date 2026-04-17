import { useState, useEffect } from 'react';
import { Container, Title, Text, Loader, Group, Avatar, Badge, Stack, Table, Anchor, Divider, Button } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { firebaseDb } from '../lib/firebase';
import { subscribeCredits } from '../lib/credits-listener';
import { RedeemLicenseDialog } from '../components/RedeemLicenseDialog';
import type { Credits } from '../lib/api-client';

interface UserDoc {
  tier?: 'free' | 'pro';
  subscriptionStatus?: string;
}

interface Transaction {
  orderId: string;
  type: string;
  sku: string | null;
  amount: string | null;
  currency: string | null;
  date: string | null;
  testMode: boolean;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  subscription_charged:  { label: 'Subscription started', color: 'green' },
  subscription_renewed:  { label: 'Renewal',              color: 'blue' },
  subscription_refunded: { label: 'Refunded',             color: 'red' },
  credits_purchased:     { label: 'Credits purchased',    color: 'teal' },
  credits_refunded:      { label: 'Credits refunded',     color: 'red' },
};

const SKU_LABELS: Record<string, string> = {
  'pro-monthly': 'Pro Monthly',
  'pro-annual': 'Pro Annual',
  'credits-100': '100 Credits',
  'credits-300': '300 Credits',
  'credits-1000': '1000 Credits',
};

function TypeBadge({ type }: { type: string }) {
  const meta = TYPE_LABELS[type] ?? { label: type, color: 'gray' };
  return <Badge color={meta.color} variant="light" size="sm">{meta.label}</Badge>;
}

export function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemOpened, setRedeemOpened] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u && !u.isAnonymous) {
        try {
          const [uSnap, txSnap] = await Promise.all([
            getDoc(doc(firebaseDb, 'users', u.uid)),
            getDocs(query(collection(firebaseDb, 'users', u.uid, 'transactions'), orderBy('createdAt', 'desc'))),
          ]);
          setUserDoc(uSnap.data() as UserDoc ?? null);
          setTransactions(txSnap.docs.map((d) => ({ orderId: d.id, ...d.data() } as Transaction)));
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    return subscribeCredits(setCredits);
  }, []);

  const tier = credits?.tier ?? userDoc?.tier ?? 'free';
  const isPro = tier === 'pro';

  return (
    <Container py="xl" style={{ overflow: 'auto', height: '100%' }}>
      <Title order={2} mb="md">Profile</Title>

      {loading ? (
        <Loader size="sm" />
      ) : !user ? (
        <Text c="dimmed">Not signed in.</Text>
      ) : (
        <Stack gap="md">

          {/* User info + credits */}
          <Group gap="md" align="flex-start" justify="space-between" wrap="wrap">
            <Group gap="md" align="center">
              <Avatar src={user.photoURL} size={48} radius="xl" />
              <div>
                <Group gap="xs" align="center">
                  <Text fw={600} size="lg">{user.displayName || 'Guest'}</Text>
                  {user.isAnonymous
                    ? <Badge size="sm" variant="light" color="yellow">Guest</Badge>
                    : <Badge size="sm" variant="light" color={isPro ? 'violet' : 'gray'}>{isPro ? 'Pro' : 'Free'}</Badge>
                  }
                  {userDoc?.subscriptionStatus && userDoc.subscriptionStatus !== 'active' && (
                    <Badge size="sm" variant="outline" color="orange">{userDoc.subscriptionStatus}</Badge>
                  )}
                </Group>
                <Text size="sm" c="dimmed">{user.email}</Text>
              </div>
            </Group>
            {credits != null && (
              <Group gap="xl">
                <Stack gap={2}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Remaining</Text>
                  <Text fw={700} size="xl">{credits.remaining.toLocaleString()}</Text>
                </Stack>
                {(credits.packCredits ?? 0) > 0 && (
                  <Stack gap={2}>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Pack</Text>
                    <Text fw={700} size="xl">{credits.packCredits!.toLocaleString()}</Text>
                  </Stack>
                )}
                <Stack gap={2}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>{user.isAnonymous ? 'Trial' : 'Monthly'}</Text>
                  <Text fw={700} size="xl">{credits.limit.toLocaleString()}</Text>
                </Stack>
                {credits.rechargeAt && (
                  <Stack gap={2}>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Recharges</Text>
                    <Text fw={700} size="xl">
                      {new Date(credits.rechargeAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Text>
                  </Stack>
                )}
              </Group>
            )}
          </Group>

          {/* Usage by model */}
          {credits?.creditsByModel && Object.keys(credits.creditsByModel).length > 0 && (
            <>
              <Divider />
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>{user.isAnonymous ? 'Usage (trial)' : 'Usage this month'}</Text>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Model</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Credits spent</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {Object.entries(credits.creditsByModel).sort(([, a], [, b]) => b - a).map(([model, spent]) => (
                    <Table.Tr key={model}>
                      <Table.Td>{model}</Table.Td>
                      <Table.Td style={{ textAlign: 'right' }}>{spent.toLocaleString()}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </>
          )}

          <Divider />

          {/* Links row */}
          <Group gap="lg" align="center">
            <Button component={Link} to="/pricing" variant="light" size="xs">
              {user.isAnonymous ? 'Register to get more credits' : isPro ? 'Buy more credits' : 'Upgrade or buy credits'}
            </Button>
            {!user.isAnonymous && isPro && (
              <Anchor
                href="https://cc.payproglobal.com/Customer/Account/Login"
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
              >
                Manage subscription <IconExternalLink size={12} style={{ verticalAlign: 'middle' }} />
              </Anchor>
            )}
            {!user.isAnonymous && (
              <Anchor size="xs" c="dimmed" style={{ cursor: 'pointer' }} onClick={() => setRedeemOpened(true)}>
                Redeem license key
              </Anchor>
            )}
          </Group>

          {!user.isAnonymous && (
            <>
              <RedeemLicenseDialog opened={redeemOpened} onClose={() => setRedeemOpened(false)} />

              <Divider />

              {/* Transaction history */}
              <Title order={4} mb="xs">Transaction history</Title>
              {transactions.length === 0 ? (
                <Text c="dimmed" size="sm">No transactions yet.</Text>
              ) : (
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Date</Table.Th>
                      <Table.Th>Type</Table.Th>
                      <Table.Th>Product</Table.Th>
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
                          <Text size="sm">{t.sku ? (SKU_LABELS[t.sku] ?? t.sku) : '—'}</Text>
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
            </>
          )}

        </Stack>
      )}
    </Container>
  );
}

