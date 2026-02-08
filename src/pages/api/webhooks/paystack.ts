// pages/api/webhooks/paystack.ts
import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  
  // Ensure secret is available
  if (!secret) {
    return res.status(500).json({ error: 'PAYSTACK_SECRET_KEY is not configured' });
  }

  // Verify webhook signature
  const hash = crypto
    .createHmac('sha512', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');
    
  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.body;
  
  // Handle different webhook events
  switch (event.event) {
    case 'charge.success':
      // Handle successful charge
      break;
      
    case 'subscription.create':
      // Handle new subscription
      break;
      
    case 'subscription.disable':
      // Handle subscription cancellation
      break;
      
    default:
      console.log(`Unhandled event: ${event.event}`);
  }
  
  res.status(200).json({ received: true });
}