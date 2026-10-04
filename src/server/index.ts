/**
 * Central server infrastructure facade.
 *
 * Provides a unified, well-organized interface to all backend services,
 * database access, authentication helpers, logging, and communications.
 */

// Database & Admin client
export { supabaseAdmin } from "./supabase";

// Structured Logging
export { log } from "./logger";

// Authentication & Access Control
export {
  authenticateRequest,
  requireAuth,
  requireAdmin,
  requireTeacherOrAdmin,
  requireRole,
} from "./api-auth.server";

// Email Services & Templates
export {
  sendTransactionalEmail,
  emailTemplate,
  welcomeEmail,
  verifyEmailTemplate,
  mpesaReceiptEmail,
  contactAdminNotificationEmail,
  contactAutoReplyEmail,
  CONTACT_CATEGORY_LABELS,
} from "./email.server";

// SMS Services
export { sendSMS } from "./sms.server";

// Push Notifications
export { sendPushNotification } from "./push.server";
export type { PushPayload } from "./push.server";

// Rate Limiting & Circuit Breaker
export { checkPlanRateLimit, getPlanRateLimitStatus } from "./rate-limit.server";
export type { RateLimitAction, RateLimitOptions } from "./rate-limit.server";

// M-Pesa Integration
export {
  initiateSTKPush,
  upgradePlan,
  creditTopupTokens,
  verifyTransactionStatus,
} from "./mpesa.server";
