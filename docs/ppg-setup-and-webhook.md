# PayProGlobal Setup & Webhook Implementation Plan

## Part 1: PPG Dashboard Setup

### 1. Create Products

Go to **Store settings → Product setup → Add product** for each:

| Product | Type | Price | Billing |
|---------|------|-------|---------|
| Pro Monthly | Subscription | $9.00 | Monthly recurring |
| Pro Annual | Subscription | $79.00 | Annual recurring |
| 100 AI Credits | One-time | $5.00 | One-time |
| 300 AI Credits | One-time | $12.00 | One-time |
| 1,000 AI Credits | One-time | $29.00 | One-time |

For each product:
- **No license provider** — leave the licensing section empty (this is an "Access Based Product")
- **IPN URL** → `https://editsvgcode-api.azurewebsites.net/api/webhook/payproglobal`
- **SKU** (optional but useful): `pro-monthly`, `pro-annual`, `credits-100`, `credits-300`, `credits-1000`

### 2. Set Up IPN Security Keys

Go to **Store settings → General settings → Integration tab**:

- Note the **Secret Key** (used for HASH verification: `MD5(ORDER_ID + SECRET_KEY)`)
- Note the **Validation Key** (used for SIGNATURE verification: `SHA256(ORDER_ID + ORDER_STATUS + ORDER_TOTAL_AMOUNT + CUSTOMER_EMAIL + VALIDATION_KEY + TEST_MODE + IPN_TYPE_NAME)`)

Store both in Azure Function environment variables:
```
PPG_SECRET_KEY=...
PPG_VALIDATION_KEY=...
```

### 3. Enable "License to Another Person" on Products

For each Pro subscription product, confirm the checkout form shows the **"License to another person"** checkbox. This is a PPG account-level or product-level setting — contact PPG support if it doesn't appear by default.

### 4. Whitelist IPs (if your Azure Function has IP restrictions)

PPG sends webhooks from:
- IPv4: `198.199.123.239`, `157.230.8.40`
- IPv6: `2604:a880:400:d0::1843:7001`, `2604:a880:400:d1::b6c:c001`

### 5. Checkout URL Format

When the user clicks "Upgrade to Pro" in the app, redirect to:

```
https://secure.payproglobal.com/orderpage.aspx
  ?products[1][id]=YOUR_PRODUCT_ID
  &x-uid=FIREBASE_UID
  &billing-email=USER_FIREBASE_EMAIL
  &licensee-email=USER_FIREBASE_EMAIL
  &licensee-name=USER_DISPLAY_NAME
```

- `x-uid` → comes back in webhook as `ORDER_CUSTOM_FIELDS=x-uid=...`
- `billing-email` / `licensee-email` → pre-fills the checkout form (user can edit, but won't need to)
- `LICENSED_TO_EMAIL` → comes back in webhook as the canonical licensee email

### 6. Test Mode

Append `&use-test-mode=true&secret-key=YOUR_SECRET_KEY` to the checkout URL for test orders. All amounts will be `0`. Hash verification uses `MD5("1")` = `c4ca4238a0b923820dcc509a6f75849b` for test orders.

---

## Part 2: Webhook Implementation Plan

### File: `api/src/functions/webhook-ppg.ts`

#### Overview

PPG POSTs `application/x-www-form-urlencoded` to the endpoint. The function must:

1. Verify the request signature (HASH or SIGNATURE)
2. Parse the IPN type
3. Dispatch to the appropriate handler
4. Return HTTP 200 (any other code = PPG retries every 30 min, up to 3 times)

#### Firestore `users/{uid}` Document Shape

```ts
interface UserDoc {
  tier: "free" | "pro";
  subscriptionStartDay?: number;     // day-of-month (1–31) from initial OrderCharged timestamp
  subscriptionId?: string;           // PPG SUBSCRIPTION_ID
  subscriptionStatus?: "active" | "suspended" | "terminated" | "finished";
  ppgOrderId?: string;               // ORDER_ID of initial subscription charge
  ppgBuyerEmail?: string;            // CUSTOMER_EMAIL from webhook
  ppgLicenseeEmail?: string;         // LICENSED_TO_EMAIL from webhook
}
```

> Credits are **not** stored in the `users` doc. They live in `usage/{uid}` with a `month` field (billing-period key `"YYYY-MM"`) that drives auto-reset for both free and pro users. Pro users' period is anchored to `subscriptionStartDay`; free users use the calendar month.

#### IPN Events to Handle

| IPN_TYPE_NAME | Action |
|---------------|--------|
| `OrderCharged` | If subscription product → set `tier: "pro"`, save `subscriptionStartDay` (day-of-month from order timestamp), save other subscription fields. Credits auto-reset on next usage via billing period key. If credit pack product → increment `credits` in `usage/{uid}` by pack amount. |
| `SubscriptionChargeSucceed` | Keep `tier: "pro"`, update `subscriptionStatus: "active"`. Credits auto-reset by billing period key — no manual reset needed. |
| `SubscriptionSuspended` | Set `subscriptionStatus: "suspended"`, downgrade `tier: "free"` |
| `SubscriptionTerminated` | Set `subscriptionStatus: "terminated"`, downgrade `tier: "free"` |
| `SubscriptionFinished` | Set `subscriptionStatus: "finished"`, downgrade `tier: "free"` |
| `OrderRefunded` | If subscription product → downgrade `tier: "free"`. If credit pack → deduct credits (floor at 0). |

All other IPN types → log and return 200 (ignore).

#### Determining the UID

Parse `ORDER_CUSTOM_FIELDS` for `x-uid`:

```ts
function extractUid(customFields: string): string | null {
  const match = customFields?.match(/x-uid=([^,&]+)/);
  return match ? match[1] : null;
}
```

Fallback chain if UID missing:
1. Look up by `LICENSED_TO_EMAIL` via `admin.auth().getUserByEmail(licenseeEmail)`
2. Look up by `CUSTOMER_EMAIL` via `admin.auth().getUserByEmail(customerEmail)`
3. If still not found → log error, return 200 (don't retry, flag for manual review)

#### Determining the Product Type

Use the product SKU (`ORDER_ITEM_SKU`) or `PRODUCT_ID` to distinguish subscription vs credit pack:

```ts
const SUBSCRIPTION_SKUS = new Set(["pro-monthly", "pro-annual"]);
const CREDIT_PACKS: Record<string, number> = {
  "credits-100": 100,
  "credits-300": 300,
  "credits-1000": 1000,
};
```

#### Credit Pack Amounts

```ts
const CREDIT_PACKS: Record<string, number> = {
  "credits-100": 100,
  "credits-300": 300,
  "credits-1000": 1000,
};
```

These need to match the SKUs set on the PPG products.

#### Security Verification

```ts
import crypto from "crypto";

function verifyHash(orderId: string, hash: string, secretKey: string, testMode: string): boolean {
  const expected = testMode === "1"
    ? "c4ca4238a0b923820dcc509a6f75849b"  // MD5("1")
    : crypto.createHash("md5").update(orderId + secretKey).digest("hex");
  return hash.toLowerCase() === expected.toLowerCase();
}

function verifySignature(params: Record<string, string>, validationKey: string): boolean {
  const { ORDER_ID, ORDER_STATUS, ORDER_TOTAL_AMOUNT, CUSTOMER_EMAIL, TEST_MODE, IPN_TYPE_NAME, SIGNATURE } = params;
  const input = ORDER_ID + ORDER_STATUS + ORDER_TOTAL_AMOUNT + CUSTOMER_EMAIL + validationKey + TEST_MODE + IPN_TYPE_NAME;
  const expected = crypto.createHash("sha256").update(input).digest("hex");
  return SIGNATURE?.toLowerCase() === expected.toLowerCase();
}
```

Reject (return 403) if both HASH and SIGNATURE fail.

#### IP Allowlist (defence in depth)

```ts
const PPG_IPS = new Set([
  "198.199.123.239",
  "157.230.8.40",
  "2604:a880:400:d0::1843:7001",
  "2604:a880:400:d1::b6c:c001",
]);
```

Note: Azure Functions may strip or rewrite the source IP header — verify using `req.headers["x-forwarded-for"]`. Treat this as a secondary check only; rely primarily on HASH/SIGNATURE.

#### Error Handling

- Always return HTTP **200** to PPG (even on internal errors), to avoid PPG retrying valid events
- Log all errors to Application Insights / console with full params (redact card data)
- For unresolvable UID: store the raw webhook payload in Firestore `ppg_unmatched/{ORDER_ID}` for manual recovery

#### Azure Function Registration

```ts
app.http("webhook-ppg", {
  methods: ["POST"],
  authLevel: "anonymous",   // PPG can't send Azure auth tokens
  route: "webhook/payproglobal",
  handler: webhookPpgHandler,
});
```

`authLevel: "anonymous"` is correct here — security is handled by HASH/SIGNATURE verification, not Azure keys.

---

## Part 3: Environment Variables to Add

| Variable | Value | Where |
|----------|-------|-------|
| `PPG_SECRET_KEY` | From PPG Integration tab | Azure Function App Settings |
| `PPG_VALIDATION_KEY` | From PPG Integration tab | Azure Function App Settings |
| `PPG_PRO_MONTHLY_SKU` | `pro-monthly` | Azure Function App Settings (or hardcode) |
| `PPG_PRO_ANNUAL_SKU` | `pro-annual` | Azure Function App Settings (or hardcode) |

Add to `api/local.settings.json` for local testing:
```json
"PPG_SECRET_KEY": "your-test-secret-key",
"PPG_VALIDATION_KEY": "your-test-validation-key"
```
