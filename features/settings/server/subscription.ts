/**
 * Re-exports subscription helpers for the settings feature.
 *
 * Settings pages need the same `getUserSubscription` logic as billing;
 * this thin file keeps imports under `features/settings/` instead of reaching
 * across features from page components.
 *
 * @module features/settings/server/subscription
 */

export { getUserSubscription } from "@/features/billing/server/subscription";
