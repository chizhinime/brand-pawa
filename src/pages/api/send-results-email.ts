// src/pages/api/send-results-email.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, score, pillars, stage } = req.body;

    // In production, integrate with your email service (Resend, SendGrid, etc.)
    // For now, we'll just log and return success
    console.log('Email would be sent to:', email);
    console.log('Content:', { name, score, pillars, stage });

    return res.status(200).json({ success: true, message: 'Email queued for sending' });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}