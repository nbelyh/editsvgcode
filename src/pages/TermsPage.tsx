import { Container, Title, Text, Stack, Anchor, List } from '@mantine/core';

export function TermsPage() {
  return (
    <div className="page-scroll">
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Title order={1}>Terms of Service</Title>
        <Text c="dimmed" size="sm">Last updated: April 2026</Text>

        <Text>
          By accessing or using the editsvgcode.com website and services ("Service"), operated by Nikolay Belykh ("we", "us", "our"),
          you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.
        </Text>

        <Title order={3}>1. Description of Service</Title>
        <Text>
          editsvgcode.com is an online SVG code editor that allows users to create, edit, and preview SVG files in the browser.
          The Service offers both free and paid subscription tiers ("Pro") with additional features and AI-assisted capabilities.
        </Text>

        <Title order={3}>2. Age Requirements</Title>
        <Text>
          You must be at least 16 years old to use the Service (as required by the EU General Data Protection Regulation).
          By using the Service, you represent that you meet this age requirement.
        </Text>

        <Title order={3}>3. Accounts</Title>
        <Text>
          Some features require you to sign in using a third-party identity provider (Google or GitHub).
          You are responsible for maintaining the security of your account credentials.
          You must not share your account or allow others to access it.
          You are responsible for all activity under your account.
        </Text>

        <Title order={3}>4. Subscriptions and Payments</Title>
        <Text>
          All paid subscriptions and credit packs are sold by{' '}
          <Anchor href="https://payproglobal.com" target="_blank" rel="noopener noreferrer">PayPro Global, Inc.</Anchor>,
          which acts as the Merchant of Record for all transactions. PayPro Global is the seller of record —
          your purchase agreement, invoice, and payment relationship are with PayPro Global, not with us directly.
          By completing a purchase you also agree to PayPro Global's{' '}
          <Anchor href="https://payproglobal.com/terms-of-service" target="_blank" rel="noopener noreferrer">
            Terms of Service
          </Anchor>.
        </Text>
        <Text>
          PayPro Global handles payment processing, tax calculation and collection, invoicing, chargebacks, and billing-related
          customer support. Prices are listed on our <Anchor href="/pricing">Pricing</Anchor> page and may change with 30 days notice.
          Subscriptions auto-renew until cancelled.
        </Text>

        <Title order={3}>5. Credits</Title>
        <Text>
          AI-powered features (chat, code editing, image generation) consume virtual "credits".
          Each AI request costs a fixed number of credits depending on the model used (e.g. 1–3 credits
          for mini models, 5–20 for full-size models, 10–50 for image generation). The current credit
          cost per model is displayed in the Service interface.
        </Text>
        <Text>
          <strong>Monthly credits:</strong> Free and Pro tiers receive a monthly credit allowance.
          Monthly credits reset on each billing anniversary date and <strong>do not roll over</strong> —
          unused monthly credits expire at the start of each new billing period.
        </Text>
        <Text>
          <strong>Credit packs:</strong> You may purchase one-time credit packs.
          Pack credits <strong>do not expire</strong> and persist across billing periods.
          When credits are consumed, pack credits are deducted first before monthly credits.
        </Text>
        <Text>
          <strong>General rules:</strong> Credits are non-transferable between accounts and cannot be
          exchanged for cash or other value. When a subscription ends or is cancelled, the account
          reverts to the free tier allowance; any remaining monthly Pro credits are forfeited.
          Purchased pack credits are retained.
        </Text>

        <Title order={3}>6. Acceptable Use</Title>
        <Text>You agree not to:</Text>
        <List>
          <List.Item>Use the Service for any unlawful purpose.</List.Item>
          <List.Item>Attempt to gain unauthorized access to any part of the Service.</List.Item>
          <List.Item>Interfere with or disrupt the Service or its infrastructure.</List.Item>
          <List.Item>Upload content that infringes intellectual property rights of others.</List.Item>
          <List.Item>Reverse-engineer, decompile, or disassemble any part of the Service.</List.Item>
          <List.Item>Use automated tools to access the Service without permission.</List.Item>
          <List.Item>Resell access to the Service or credits to others.</List.Item>
          <List.Item>Circumvent usage limits or security measures.</List.Item>
        </List>

        <Title order={3}>7. Intellectual Property</Title>
        <Text>
          The Service, its original content (excluding user-generated content), features, and functionality are owned by us
          and are protected by copyright and other intellectual property laws.
        </Text>
        <Text>
          <strong>Your content:</strong> You retain full ownership of all SVG files and other content you create or upload using the Service.
          You grant us a temporary license to process your files solely for the purpose of providing the Service.
        </Text>
        <Text>
          <strong>AI-generated content:</strong> You own all AI-generated content you create using the Service.
          You may use it commercially, sell it, or include it in client work.
          We do not claim any ownership of your AI-generated outputs.
          Note: AI-generated content may not be copyrightable in some jurisdictions.
        </Text>

        <Title order={3}>8. Account Deletion</Title>
        <Text>
          You may request deletion of your account and associated data at any time by contacting us at{' '}
          <Anchor href="mailto:support@unmanagedvisio.com">support@unmanagedvisio.com</Anchor>.
          Account deletion will be processed within 30 days. Upon deletion, your data will be permanently removed,
          except where retention is required by law (e.g. transaction records for tax purposes).
        </Text>

        <Title order={3}>9. Disclaimer of Warranties</Title>
        <Text>
          The Service is provided "as is" and "as available" without warranties of any kind, either express or implied,
          including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
          We do not warrant that the Service will be uninterrupted, error-free, or secure.
        </Text>

        <Title order={3}>10. Limitation of Liability</Title>
        <Text>
          To the maximum extent permitted by applicable law, we shall not be liable for any indirect, incidental, special,
          consequential, or punitive damages, or any loss of profits or data, arising out of or relating to your use of the Service.
          Our total liability for any claim shall not exceed the amount you paid us in the 12 months preceding the claim.
        </Text>

        <Title order={3}>11. Indemnification</Title>
        <Text>
          You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from your use of the Service,
          your violation of these Terms, or your infringement of any rights of a third party.
        </Text>

        <Title order={3}>12. Termination</Title>
        <Text>
          We may terminate or suspend your access to the Service at any time, without prior notice, for conduct that
          we believe violates these Terms or is harmful to other users, us, or third parties. Upon termination,
          your right to use the Service ceases immediately. Unused credits are forfeited and no refunds are issued for partial billing periods.
        </Text>

        <Title order={3}>13. Service Modifications</Title>
        <Text>
          We may modify, suspend, or discontinue the Service (or any part of it) at any time.
          We will provide reasonable notice for significant changes affecting paid features.
        </Text>

        <Title order={3}>14. Severability</Title>
        <Text>
          If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
        </Text>

        <Title order={3}>15. Changes to Terms</Title>
        <Text>
          We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes
          acceptance of the updated Terms. We will notify users of material changes and indicate the date of the last update at the top of this page.
        </Text>

        <Title order={3}>16. Governing Law</Title>
        <Text>
          These Terms shall be governed by and construed in accordance with the laws of Austria.
          Any disputes shall be subject to the exclusive jurisdiction of the courts of Vienna, Austria.
        </Text>

        <Title order={3}>17. Contact</Title>
        <Text>
          If you have questions about these Terms, please contact us at{' '}
          <Anchor href="mailto:support@unmanagedvisio.com">support@unmanagedvisio.com</Anchor>.
        </Text>
      </Stack>
    </Container>
    </div>
  );
}
