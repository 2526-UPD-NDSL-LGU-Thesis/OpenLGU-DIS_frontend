import { z } from 'zod';

export const userRolesListSchema = z.enum([
    "Super",
    "Sector Admin",
    "Sector Employee",
    "Service Admin",
    "Service Employee",
    "Service Claim Admin",
    "Service Claim Employee",
    "ID Management Admin",
    "ID Management Employee",
])

const apiUserProfileSchema = z.object({
    username: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    groups: z.array(
        z.object({ name: userRolesListSchema })
    ),
    assignment: z.nullable(z.object({
        groups: z.array(
            z.object({ name: z.string(), description: z.nullable(z.string())})
        ),
        last_update: z.iso.datetime({ offset: true }),
        user: z.number(),
        assigned_by: z.nullable(z.number())
    }))
});

export const userProfileSchema = apiUserProfileSchema.transform((data) => ({
    username: data.username,
    name: data.first_name + " " + data.last_name,
    roles: data.groups.map((role) => role.name),
    assignedClaims: data.assignment?.groups.map((claim) => claim.name) ?? [],
}));

export type UserRolesList = z.infer<typeof userRolesListSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;