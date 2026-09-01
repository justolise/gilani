/**
 * Backend utility for sending transactional emails via Resend API.
 * Re-exports base senders and all modularized email templates.
 */

export * from "./email/base.server";
export * from "./email/auth-templates.server";
export * from "./email/billing-templates.server";
export * from "./email/notification-templates.server";
