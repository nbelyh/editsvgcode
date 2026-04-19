import { Container, Title, Text, Stack, Anchor } from '@mantine/core';

export function ImprintPage() {
  return (
    <div className="page-scroll">
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Title order={1}>Imprint (Impressum)</Title>
        <Text c="dimmed" size="sm">Information pursuant to § 5 ECG (Austrian E-Commerce Act)</Text>

        <Title order={3}>Service Operator</Title>
        <Text>
          Nikolay Belykh<br />
          O-Brien Gasse 58/2/27<br />
          1210 Vienna<br />
          Austria<br /><br />
          VAT ID: ATU70106627
        </Text>

        <Title order={3}>Contact</Title>
        <Text>
          Email: <Anchor href="mailto:support@unmanagedvisio.com">support@unmanagedvisio.com</Anchor><br />
          Phone: <Anchor href="tel:+4366473887141">+43 664 7388 7141</Anchor><br />
          Website: <Anchor href="https://unmanagedvisio.com" target="_blank" rel="noopener noreferrer">unmanagedvisio.com</Anchor>
        </Text>

        <Title order={3}>Merchant of Record</Title>
        <Text>
          All subscriptions and credit packs are sold by{' '}
          <Anchor href="https://payproglobal.com" target="_blank" rel="noopener noreferrer">PayPro Global, Inc.</Anchor>{' '}
          acting as Merchant of Record. PayPro Global is the legal seller and handles payment processing,
          tax collection, invoicing, chargebacks, and billing-related customer support.<br /><br />
          PayPro Global, Inc.<br />
          225 The East Mall, Suite 1117<br />
          Toronto, ON, M9B 0A9, Canada
        </Text>

        <Title order={3}>Dispute Resolution</Title>
        <Text>
          The European Commission provides a platform for online dispute resolution (ODR):{' '}
          <Anchor href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
            https://ec.europa.eu/consumers/odr
          </Anchor>.<br />
          We are not obligated and not willing to participate in dispute resolution proceedings before a consumer arbitration board.
        </Text>

        <Title order={3}>Liability for Content</Title>
        <Text>
          As a service provider, we are responsible for our own content on these pages in accordance with general laws.
          However, we are not obligated to monitor transmitted or stored third-party information.
          Obligations to remove or block the use of information under general law remain unaffected.
        </Text>
      </Stack>
    </Container>
    </div>
  );
}
