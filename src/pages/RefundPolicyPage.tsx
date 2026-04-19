import { Container, Title, Text, Stack, Anchor } from '@mantine/core';

export function RefundPolicyPage() {
  return (
    <div className="page-scroll">
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Title order={1}>Refund & Cancellation Policy</Title>
        <Text c="dimmed" size="sm">Last updated: April 2026</Text>

        <Title order={3}>Merchant of Record</Title>
        <Text>
          All paid subscriptions and credit packs are sold by{' '}
          <Anchor href="https://payproglobal.com" target="_blank" rel="noopener noreferrer">PayPro Global, Inc.</Anchor>,
          which acts as the Merchant of Record (MoR) for all transactions. PayPro Global is the legal seller —
          it handles payment processing, tax collection, invoicing, and billing-related customer support.
        </Text>

        <Title order={3}>Cancellation</Title>
        <Text>
          You may cancel your subscription at any time through PayPro Global's customer portal or by contacting us.
          After cancellation, your Pro features remain active until the end of the current billing period.
          No further charges will be made after cancellation.
        </Text>

        <Title order={3}>Refund for Subscriptions</Title>
        <Text>
          If you are not satisfied with your subscription, you may request a full refund within <strong>30 days</strong> of
          your initial purchase or the most recent renewal. Refund requests can be submitted to{' '}
          <Anchor href="mailto:support@unmanagedvisio.com">support@unmanagedvisio.com</Anchor>,{' '}
          or directly through PayPro Global's customer portal. Refunds are processed by PayPro Global.
        </Text>

        <Title order={3}>Credit Packs</Title>
        <Text>
          Purchased credit packs are non-refundable once any credits from the pack have been used.
          If no credits have been consumed, a full refund may be requested within <strong>30 days</strong> of purchase.
        </Text>

        <Title order={3}>EU Right of Withdrawal</Title>
        <Text>
          Under EU consumer protection law, you have a 14-day right of withdrawal for online purchases.
          By using the Service (e.g. consuming credits or accessing Pro features) before the withdrawal period ends,
          you acknowledge that you may lose this right for the portion of the service already consumed.
        </Text>

        <Title order={3}>How to Request a Refund</Title>
        <Text>
          Contact us at{' '}
          <Anchor href="mailto:support@unmanagedvisio.com">support@unmanagedvisio.com</Anchor>{' '}
          with your order ID and the reason for your request, or use PayPro Global's{' '}
          <Anchor href="https://cc.payproglobal.com/Customer/Account/Login" target="_blank" rel="noopener noreferrer">
            customer portal
          </Anchor>.
          We aim to process all refund requests within 5 business days.
        </Text>
      </Stack>
    </Container>
    </div>
  );
}
