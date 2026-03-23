import { NOT_ORG_MEMBER_ERR_MSG, NOT_HR_ERR_MSG } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "./trpc";
import { getOrgMemberByUserAndOrg } from "../db";
import type { OrgMember } from "../../drizzle/schema";

/**
 * Org-scoped procedure: requires auth + active org membership.
 * Adds `ctx.orgMember` and `ctx.orgId` to the context.
 */
export const orgProcedure = protectedProcedure
  .input(z.object({ orgId: z.number().int().positive() }))
  .use(async ({ ctx, input, next }) => {
    // Super admin bypasses org membership check
    if (ctx.user.role === "admin") {
      return next({
        ctx: { ...ctx, orgMember: null as OrgMember | null, orgId: input.orgId },
      });
    }

    const member = await getOrgMemberByUserAndOrg(ctx.user.id, input.orgId);
    if (!member || member.status !== "active") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ORG_MEMBER_ERR_MSG });
    }
    return next({
      ctx: { ...ctx, orgMember: member as OrgMember | null, orgId: input.orgId },
    });
  });

const HR_ROLES = ["owner", "hr_admin", "hr_viewer"];
const HR_WRITE_ROLES = ["owner", "hr_admin"];

/**
 * HR procedure: requires owner, hr_admin, or hr_viewer role within the org.
 */
export const hrProcedure = orgProcedure.use(async ({ ctx, next }) => {
  // Super admin always passes
  if (ctx.user.role === "admin") return next({ ctx });

  const member = ctx.orgMember as OrgMember | null;
  if (!member || !HR_ROLES.includes(member.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: NOT_HR_ERR_MSG });
  }
  return next({ ctx });
});

/**
 * HR write procedure: requires owner or hr_admin (not hr_viewer).
 */
export const hrWriteProcedure = orgProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role === "admin") return next({ ctx });

  const member = ctx.orgMember as OrgMember | null;
  if (!member || !HR_WRITE_ROLES.includes(member.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: NOT_HR_ERR_MSG });
  }
  return next({ ctx });
});
