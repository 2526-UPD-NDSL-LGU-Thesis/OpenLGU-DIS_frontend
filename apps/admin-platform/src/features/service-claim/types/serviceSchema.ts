/* Types for service claiming dashboard and claim operations. */

import { z } from 'zod';
import { apiUserProfileSchema } from '#/types/schema';

const apiServiceSchema = z.array(z.object({
  id: z.string(),
  name: z.string(),
  description: z.nullable(z.string()),
  recipient_sectors: z.array(z.object({ name: z.string() })),
  allowed_groups: z.array(z.object({ name: z.string() })),
  max_claims_per_user: z.number(),
  claim_type: z.enum(["onetime", "perodioc"]),
  refresh_interval: z.nullable(z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"])),
  stocks_type: z.enum(["unlimited", "limited"]),
  stocks: z.nullable(z.number()),
  active: z.boolean()
}));

export const serviceItemSchema = apiServiceSchema.unwrap()
export type ServiceItem = z.infer<typeof serviceItemSchema>

const apiClaimsSchema = z.array(z.object({
  user: z.object({ uin: z.string(), pcn: z.string() }), // TODO make a residentSchema and use it here
  claimed_by: apiUserProfileSchema.pick({ username: true, first_name: true, last_name: true}),
  service: serviceItemSchema.pick({ id: true, name: true, description: true }),
  transaction_id: z.string(),
  amount: z.number(),
  claimed_at: z.date(),
  notes: z.nullable(z.string())
}));

export type ClaimItem = z.infer<typeof apiClaimsSchema.unwrap>

const apiClaimGroupsSchema = z.array(z.object({
  id: z.string(),
  name: z.string(),
  description: z.nullable(z.string())
}));

export type ClaimGroup = z.infer<typeof apiClaimGroupsSchema.unwrap>

