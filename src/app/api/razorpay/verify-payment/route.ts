import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { error: 'Missing mandatory payment verification fields' },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const isMockOrder = razorpay_order_id.startsWith('order_mock_');
    const isPlaceholderSecret = !keySecret || keySecret.includes('YOUR_RAZORPAY') || keySecret === 'YOUR_RAZORPAY_KEY_SECRET_HERE';

    // Sandbox / Development verification bypass
    if (isMockOrder || isPlaceholderSecret) {
      return NextResponse.json({
        verified: true,
        isSandbox: true,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        message: 'Payment verified in Sandbox mode'
      });
    }

    // Cryptographic HMAC-SHA256 signature verification for Production & Live Test Keys
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      console.error('Razorpay signature mismatch:', {
        expected: expectedSignature,
        received: razorpay_signature
      });
      return NextResponse.json(
        { error: 'Payment signature verification failed. Potential tampering detected.', verified: false },
        { status: 400 }
      );
    }

    return NextResponse.json({
      verified: true,
      isSandbox: false,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      message: 'Payment cryptographically verified successfully'
    });

  } catch (error: any) {
    console.error('Verify Payment Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Server error during payment verification' },
      { status: 500 }
    );
  }
}
