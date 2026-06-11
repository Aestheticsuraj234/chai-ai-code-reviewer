import Razorpay from "razorpay";

let razorpay: Razorpay | null = null;

export function getRazorpay() {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  return razorpay;
}
