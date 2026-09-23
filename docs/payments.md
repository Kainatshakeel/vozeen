# Payment integration status

Amounts use integer paisa (PKR × 100). No card number, CVV, PIN, or OTP enters this application. Unconfigured online methods are disabled. COD works once PostgreSQL is connected.

## JazzCash

The direct adapter builds a signed MWALLET hosted-checkout request. Configure `JAZZCASH_MERCHANT_ID`, `JAZZCASH_PASSWORD`, and `JAZZCASH_INTEGRITY_SALT`. Sandbox is the default; set `JAZZCASH_LIVE=true` only after merchant acceptance testing. Register `/api/payments/jazzcash/callback` as the return URL. HMAC, merchant, amount, currency, order, and transaction reference are checked before marking an order paid.

This adapter follows the public hosted-checkout sample and still needs a merchant sandbox test, including the exact callback fields supplied for your account. Confirm signature canonicalization and callback currency/reference fields against your current merchant integration pack before activation.

- Official samples: https://sandbox.jazzcash.com.pk/SandboxDocumentation/v4.2/index.html
- API reference: https://sandbox.jazzcash.com.pk/SandboxDocumentation/ApiReferences.html

## Cards via Stripe

Configure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` for an eligible Stripe merchant account. Checkout Sessions are created server-side in PKR with an idempotency key. Register `/api/payments/stripe` for `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Only a verified webhook with `payment_status=paid`, PKR, the expected order and amount updates payment status. Card details stay on Stripe-hosted checkout.

Verify Stripe account eligibility and PKR presentment for your business. This is not a claim that Stripe onboards Pakistani entities. Use a local gateway if your business is not eligible.

## EasyPaisa / PayFast merchant bridge — integration boundary

Direct EasyPaisa and PayFast API adapters are NOT implemented or verified. Their current merchant-specific documentation and credentials were unavailable. A secure bridge contract allows an approved merchant adapter to be connected without changing checkout or order accounting. This is an additional service you must implement or obtain, not an API those providers promise to expose.

Official resources:

- https://easypay.easypaisa.com.pk/easypay-merchant/faces/pg/site/IntegrationGuides.jsf
- https://gopayfast.com/docs/

Configure `PAYMENT_BRIDGE_URL` (HTTPS), `PAYMENT_BRIDGE_KEY`, `PAYMENT_WEBHOOK_SECRET`, and `PAYMENT_ALLOWED_HOSTS` (comma-separated exact hosted-checkout hostnames). The application POSTs:

```json
{
  "orderId": "T...",
  "amount": 510000,
  "currency": "PKR",
  "method": "EASYPAISA",
  "email": "customer@example.com",
  "returnUrl": "https://vozeen.com/orders/...?...",
  "webhookUrl": "https://vozeen.com/api/payments/webhook"
}
```

Headers: `Authorization: Bearer <key>`, `Idempotency-Key: <order ID>`. The bridge must create or reuse the same gateway transaction for that order. Response: `{"checkoutUrl":"https://allowed-provider-host/..."}`. The bridge must verify the provider's native webhook or inquiry response before forwarding:

```json
{
  "orderId": "T...",
  "amount": 510000,
  "currency": "PKR",
  "method": "EASYPAISA",
  "reference": "provider-transaction-reference",
  "status": "succeeded"
}
```

Headers: `x-payment-timestamp` (Unix seconds), `x-payment-signature` = hexadecimal HMAC-SHA256 of `<timestamp>.<exact raw JSON body>` keyed with `PAYMENT_WEBHOOK_SECRET`. Events older than five minutes or with invalid signatures are rejected. Successful events are idempotent. Pending/failed events do not authorize fulfilment. Retried delivery must use a fresh timestamp/signature.

## Operations

Stock is reserved at order creation. Unpaid/abandoned orders stay pending for reconciliation. Admins can cancel unpaid, unshipped orders to restore stock and coupon use atomically. Do not auto-release stock after an ambiguous timeout: a payment may still be completing. Late payment for a cancelled order requires manual reconciliation/refund. Refund execution and automatic reconciliation jobs are not implemented. Never log merchant secrets.
