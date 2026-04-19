import { Container, Title, Text, Stack, Anchor, List } from '@mantine/core';

export function PrivacyPolicyPage() {
  return (
    <div className="page-scroll">
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Title order={1}>Privacy Policy</Title>
        <Text c="dimmed" size="sm">Last updated: April 2026</Text>

        <Text>
          Your privacy is important to us, and so is being transparent about how we collect, use, and share information about you.
          This Privacy Policy covers the information we collect about you when you use the editsvgcode.com website and services ("Service"),
          operated by Nikolay Belykh / UnmanagedVisio ("we", "us", "our").
        </Text>

        <Title order={2}>1. Controller</Title>
        <Text>
          The controller responsible for data processing is:<br /><br />
          Nikolay Belykh<br />
          O-Brien Gasse 58<br />
          1210 Vienna, Austria<br /><br />
          Email: <Anchor href="mailto:support@unmanagedvisio.com">support@unmanagedvisio.com</Anchor><br />
          Phone: +43 664 7388 7141
        </Text>

        <Title order={2}>2. What Data We Collect</Title>

        <Title order={3}>a) Account information</Title>
        <Text>
          When you sign in using Google or GitHub, we receive your name, email address, and profile picture
          from the identity provider. This data is stored in Firebase Authentication and Firestore to manage your account.
        </Text>

        <Title order={3}>b) Usage data</Title>
        <Text>
          We collect anonymized usage information using Google Analytics (with IP anonymization enabled),
          including pages visited, browser type, and referring site. This data is used to improve the Service.
        </Text>

        <Title order={3}>c) Payment data</Title>
        <Text>
          When you purchase a subscription or credit pack, the sale is handled by{' '}
          <Anchor href="https://payproglobal.com" target="_blank" rel="noopener noreferrer">PayPro Global, Inc.</Anchor>,
          which acts as the Merchant of Record (legal seller). Your payment data (credit card, bank details) is
          collected and processed exclusively by PayPro Global — we never receive or store it.
          We receive only your order ID, email address, and subscription status from PayPro Global
          in order to activate your account features.
        </Text>

        <Title order={3}>d) SVG content</Title>
        <Text>
          SVG files you create and edit are stored locally in your browser (localStorage) or, if you are signed in,
          in Firebase Cloud Storage associated with your account. We do not access or analyze the content of your files.
        </Text>

        <Title order={3}>e) AI features</Title>
        <Text>
          When you use AI-powered features, the content you submit (SVG code, images, text prompts) is sent to
          third-party AI model providers (e.g. OpenAI, Google) for processing. We do not store AI request or response data
          beyond what is needed to deliver the result.
        </Text>

        <Title order={2}>3. Cookies</Title>
        <Text>
          We use cookies for:
        </Text>
        <List>
          <List.Item><strong>Essential cookies</strong> — Firebase authentication session management.</List.Item>
          <List.Item><strong>Analytics cookies</strong> — Google Analytics (only set with your consent).</List.Item>
          <List.Item><strong>Preference cookies</strong> — Storing your color scheme preference.</List.Item>
        </List>
        <Text>
          You can manage cookie preferences through the cookie consent banner or your browser settings.
          Disabling essential cookies may prevent parts of the Service from functioning correctly.
        </Text>

        <Title order={2}>4. How We Use Your Data</Title>
        <List>
          <List.Item>Provide and maintain the Service</List.Item>
          <List.Item>Manage your account and subscription</List.Item>
          <List.Item>Process payments via PayPro Global</List.Item>
          <List.Item>Improve the Service based on usage statistics</List.Item>
          <List.Item>Detect and prevent abuse or fraud</List.Item>
        </List>

        <Title order={2}>5. Data Sharing</Title>
        <Text>
          We do not sell your personal data. We share data only with the following third-party processors
          as necessary to operate the Service:
        </Text>
        <List>
          <List.Item><strong>Google / Firebase</strong> — Authentication, database, cloud storage, analytics</List.Item>
          <List.Item><strong>PayPro Global</strong> — Merchant of Record (sales, payments, tax, invoicing)</List.Item>
          <List.Item><strong>Microsoft Azure</strong> — Hosting (Azure Static Web Apps, Azure Functions)</List.Item>
          <List.Item><strong>AI providers</strong> (OpenAI, Google) — Processing AI feature requests</List.Item>
        </List>

        <Title order={2}>6. Data Retention</Title>
        <Text>
          Account data is retained for as long as your account is active. If you delete your account,
          your personal data will be erased within 30 days, except where retention is required by law
          (e.g. transaction records for tax purposes).
          Analytics data is retained according to Google Analytics' standard retention policies.
        </Text>

        <Title order={2}>7. Your Rights (GDPR)</Title>
        <Text>
          Under the General Data Protection Regulation (GDPR), you have the right to:
        </Text>
        <List>
          <List.Item><strong>Access</strong> — Request a copy of your personal data.</List.Item>
          <List.Item><strong>Rectification</strong> — Request correction of inaccurate data.</List.Item>
          <List.Item><strong>Erasure</strong> — Request deletion of your personal data ("right to be forgotten").</List.Item>
          <List.Item><strong>Restriction</strong> — Request limitation of data processing.</List.Item>
          <List.Item><strong>Portability</strong> — Receive your data in a structured, machine-readable format.</List.Item>
          <List.Item><strong>Object</strong> — Object to processing based on legitimate interests.</List.Item>
          <List.Item><strong>Withdraw consent</strong> — Withdraw consent at any time where processing is based on consent.</List.Item>
        </List>
        <Text>
          To exercise any of these rights, contact us at{' '}
          <Anchor href="mailto:support@unmanagedvisio.com">support@unmanagedvisio.com</Anchor>.
        </Text>

        <Title order={2}>8. Data Security</Title>
        <Text>
          We implement appropriate technical and organizational measures to protect your personal data,
          including encrypted connections (HTTPS), access controls, and secure cloud infrastructure.
          However, no method of transmission over the Internet is 100% secure.
        </Text>

        <Title order={2}>9. Children</Title>
        <Text>
          The Service is not directed at children under the age of 16. We do not knowingly collect
          personal data from children. If you believe a child has provided us with personal data,
          please contact us so we can delete it.
        </Text>

        <Title order={2}>10. Changes to This Policy</Title>
        <Text>
          We may update this Privacy Policy from time to time. The date of the last update is shown at the top of this page.
          Continued use of the Service after changes constitutes acceptance of the updated policy.
        </Text>

        <Title order={2}>11. Supervisory Authority</Title>
        <Text>
          You have the right to lodge a complaint with the Austrian Data Protection Authority
          (Österreichische Datenschutzbehörde):{' '}
          <Anchor href="https://www.dsb.gv.at" target="_blank" rel="noopener noreferrer">www.dsb.gv.at</Anchor>.
        </Text>

        <Title order={2}>12. Contact</Title>
        <Text>
          If you have questions about this Privacy Policy, contact us at{' '}
          <Anchor href="mailto:support@unmanagedvisio.com">support@unmanagedvisio.com</Anchor>.
        </Text>
      </Stack>
    </Container>
    </div>
  );
}
