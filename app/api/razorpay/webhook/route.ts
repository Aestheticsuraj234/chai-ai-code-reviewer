import { handleRazorpayWebhook } from "@/features/billing/server/webhook-handler";

export async function POST(request: Request) {
  return handleRazorpayWebhook(request);
}
