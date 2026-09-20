/**
 * Subscription Access Control
 * Checks user subscription status and gates premium features
 */

import { prisma } from "@/lib/prisma";

/**
 * Check if a user has an active Pro subscription
 */
export async function checkActiveSubscription(userId: string): Promise<{
  isActive: boolean;
  plan: string;
  expiresAt: Date | null;
}> {
  // Check Subscription table first (Razorpay-based)
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      plan: "PRO",
    },
    orderBy: { createdAt: "desc" },
  });

  if (subscription && subscription.currentPeriodEnd) {
    const now = new Date();
    if (subscription.currentPeriodEnd > now) {
      return {
        isActive: true,
        plan: "PRO",
        expiresAt: subscription.currentPeriodEnd,
      };
    }
  }

  // Fallback: Check Profile subscription fields (legacy/admin-approved)
  const profile = await prisma.profile.findUnique({
    where: { userId },
  });

  if (profile && profile.subscription === "PRO" && profile.subscriptionEndDate) {
    const now = new Date();
    if (profile.subscriptionEndDate > now) {
      return {
        isActive: true,
        plan: "PRO",
        expiresAt: profile.subscriptionEndDate,
      };
    }
  }

  if (profile && profile.subscription === "ENTERPRISE" && profile.subscriptionEndDate) {
    const now = new Date();
    if (profile.subscriptionEndDate > now) {
      return {
        isActive: true,
        plan: "ENTERPRISE",
        expiresAt: profile.subscriptionEndDate,
      };
    }
  }

  return {
    isActive: false,
    plan: "FREE",
    expiresAt: null,
  };
}

/**
 * Require an active Pro subscription, throws if not found
 */
export async function requirePro(userId: string): Promise<void> {
  const sub = await checkActiveSubscription(userId);
  if (!sub.isActive) {
    throw new Error("SUBSCRIPTION_REQUIRED");
  }
}

/**
 * Generate a unique invoice number
 */
export function generateInvoiceNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DB-INV-${timestamp}-${random}`;
}
