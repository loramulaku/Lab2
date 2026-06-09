/**
 * Tests that Stripe webhook signature verification works correctly.
 *
 * Run with: node test_webhook_signature.js
 * (Backend must be running on port 3001)
 */
require('dotenv').config();
const Stripe = require('stripe');
const http   = require('http');

const WEBHOOK_URL    = 'http://localhost:3001/api/subscriptions/webhook';
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const stripe         = new Stripe(process.env.STRIPE_SECRET_KEY);

if (!WEBHOOK_SECRET) {
  console.error('ERROR: STRIPE_WEBHOOK_SECRET not set in .env');
  process.exit(1);
}

// Minimal Stripe event payload
const testEvent = JSON.stringify({
  id:   'evt_test_' + Date.now(),
  type: 'checkout.session.completed',
  data: {
    object: {
      id:             'cs_test_probe',
      object:         'checkout.session',
      payment_status: 'paid',
      metadata:       { companyId: '0', planId: '0' },
      payment_intent: null,
      subscription:   null,
    },
  },
});

function post(url, body, headers) {
  return new Promise((resolve, reject) => {
    const u   = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port:     u.port,
      path:     u.pathname,
      method:   'POST',
      headers:  { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), ...headers },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function pass(msg) { console.log('\x1b[32m  PASS\x1b[0m', msg); }
function fail(msg) { console.log('\x1b[31m  FAIL\x1b[0m', msg); }

async function run() {
  console.log('\n=== Webhook Signature Verification Tests ===\n');
  let allPassed = true;

  // ── Test 1: No Stripe-Signature header → must get 400 ─────────────────────
  {
    const r = await post(WEBHOOK_URL, testEvent, {});
    const ok = r.status === 400;
    if (ok) pass('No signature header → 400 Bad Request');
    else { fail(`No signature header → expected 400, got ${r.status}: ${r.body}`); allPassed = false; }
  }

  // ── Test 2: Wrong/forged signature → must get 400 ─────────────────────────
  {
    const r = await post(WEBHOOK_URL, testEvent, {
      'stripe-signature': 't=1234567890,v1=forgedSignatureXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    });
    const ok = r.status === 400;
    if (ok) pass('Forged signature → 400 Bad Request');
    else { fail(`Forged signature → expected 400, got ${r.status}: ${r.body}`); allPassed = false; }
  }

  // ── Test 3: Valid signature computed with WEBHOOK_SECRET → must get 200 ───
  {
    // stripe.webhooks.generateTestHeaderString creates the correct HMAC-SHA256
    // header that constructEvent will accept.
    const validHeader = stripe.webhooks.generateTestHeaderString({
      payload: testEvent,
      secret:  WEBHOOK_SECRET,
    });
    const r = await post(WEBHOOK_URL, testEvent, { 'stripe-signature': validHeader });
    // 200 = handler ran (may fail internally for missing plan/company, that's fine)
    // We accept 200 and 500 as "signature passed" (400 = rejected)
    const ok = r.status !== 400;
    if (ok) pass(`Valid signature → ${r.status} (signature accepted, handler ran)`);
    else { fail(`Valid signature → expected 200/500, got 400 (signature rejected): ${r.body}`); allPassed = false; }
  }

  // ── Test 4: Valid signature but body tampered → must get 400 ──────────────
  {
    const validHeader = stripe.webhooks.generateTestHeaderString({
      payload: testEvent,
      secret:  WEBHOOK_SECRET,
    });
    const tamperedBody = testEvent.replace('checkout.session.completed', 'malicious.event');
    const r = await post(WEBHOOK_URL, tamperedBody, { 'stripe-signature': validHeader });
    const ok = r.status === 400;
    if (ok) pass('Tampered body (signature mismatch) → 400 Bad Request');
    else { fail(`Tampered body → expected 400, got ${r.status}: ${r.body}`); allPassed = false; }
  }

  console.log('\n' + (allPassed ? '\x1b[32mAll tests passed\x1b[0m' : '\x1b[31mSome tests FAILED\x1b[0m') + '\n');
  process.exit(allPassed ? 0 : 1);
}

run().catch(err => { console.error(err); process.exit(1); });
