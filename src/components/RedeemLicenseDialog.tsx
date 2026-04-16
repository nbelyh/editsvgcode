import { useState } from 'react';
import { Modal, TextInput, Button, Group, Text, Alert } from '@mantine/core';
import { getAuth } from 'firebase/auth';
import { config } from '../lib/config';

interface RedeemLicenseDialogProps {
  opened: boolean;
  onClose: () => void;
}

export function RedeemLicenseDialog({ opened, onClose }: RedeemLicenseDialogProps) {
  const [licenseKey, setLicenseKey] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  const handleClose = () => {
    setLicenseKey('');
    setStatus(null);
    onClose();
  };

  const handleRedeem = async () => {
    setRedeeming(true);
    setStatus(null);
    try {
      const token = await getAuth().currentUser?.getIdToken();
      const res = await fetch(`${config.API_URL}/api/redeem-license`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ token: licenseKey.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: 'License redeemed successfully!' });
        setLicenseKey('');
      } else {
        setStatus({ type: 'error', message: data.error ?? 'Redemption failed' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error' });
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Redeem license key">
      <Text size="sm" c="dimmed" mb="md">
        If your purchase wasn&apos;t activated automatically, paste the license key from your order confirmation email.
      </Text>
      <TextInput
        placeholder="Paste license key here"
        value={licenseKey}
        onChange={(e) => { setLicenseKey(e.currentTarget.value); setStatus(null); }}
        mb="md"
      />
      {status && (
        <Alert color={status.type === 'success' ? 'green' : 'red'} mb="md">
          {status.message}
        </Alert>
      )}
      <Group justify="flex-end">
        <Button variant="default" onClick={handleClose}>Cancel</Button>
        <Button loading={redeeming} disabled={!licenseKey.trim()} onClick={handleRedeem}>
          Redeem
        </Button>
      </Group>
    </Modal>
  );
}
