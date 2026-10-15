import { prisma } from "@/lib/db/prisma";
import { isOwnerEmail } from "./staffPermissions";

export interface ClerkUserData {
  clerkId: string;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  imageUrl?: string | null;
}

/**
 * Synchronizes an authenticated Clerk user into the application's PostgreSQL database (Neon).
 * Ensures that every real signup or signin has an associated User record and initial Wallet row.
 *
 * Requirements:
 * 1. Idempotent upsert keyed by Clerk ID.
 * 2. Links to an existing row with the same email instead of creating a duplicate.
 * 3. Roles are computed, never trusted from the database:
 *    - OWNER only when verified email equals OWNER_EMAIL.
 *    - Treat a database OWNER for any other email as CLIENT and log the anomaly.
 */
export async function syncClerkUserToDatabase(userData: ClerkUserData) {
  if (!userData.clerkId) {
    return null;
  }

  const normalizedEmail = userData.email?.trim().toLowerCase() || null;
  const isOwner = Boolean(normalizedEmail && isOwnerEmail(normalizedEmail));

  try {
    if (prisma && (prisma as any).user) {
      // 1. Try finding user by clerkId
      let user = await prisma.user.findUnique({
        where: { clerkId: userData.clerkId },
        include: { wallet: true },
      });

      // 2. If not found by clerkId, search by email or identifier to link existing record
      if (!user && normalizedEmail) {
        user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: { equals: normalizedEmail, mode: "insensitive" } },
              { identifier: { equals: normalizedEmail, mode: "insensitive" } },
            ],
          },
          include: { wallet: true },
        });

        if (user) {
          // Link existing user row to this clerkId instead of creating a duplicate
          let computedRole = user.role;
          if (isOwner) {
            computedRole = "OWNER";
          } else if (user.role === "OWNER") {
            console.warn(
              `[SECURITY ANOMALY] User "${normalizedEmail || userData.clerkId}" had database role OWNER but does not match OWNER_EMAIL. Corrected to CLIENT.`
            );
            computedRole = "CLIENT";
          }

          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              clerkId: userData.clerkId,
              email: normalizedEmail,
              name: userData.name || user.name,
              role: computedRole,
            },
            include: { wallet: true },
          });
        }
      }

      // 3. If not found by clerkId or email, check by phone if provided
      if (!user && userData.phone) {
        user = await prisma.user.findUnique({
          where: { phone: userData.phone },
          include: { wallet: true },
        });

        if (user) {
          let computedRole = user.role;
          if (isOwner) {
            computedRole = "OWNER";
          } else if (user.role === "OWNER") {
            console.warn(
              `[SECURITY ANOMALY] User "${userData.phone || userData.clerkId}" had database role OWNER but does not match OWNER_EMAIL. Corrected to CLIENT.`
            );
            computedRole = "CLIENT";
          }

          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              clerkId: userData.clerkId,
              email: normalizedEmail || user.email,
              name: userData.name || user.name,
              role: computedRole,
            },
            include: { wallet: true },
          });
        }
      }

      // 4. If user still does not exist, create new user and associated wallet
      if (!user) {
        let safePhone = userData.phone || null;
        if (safePhone) {
          const existingPhoneUser = await prisma.user.findUnique({ where: { phone: safePhone } });
          if (existingPhoneUser) {
            safePhone = null;
          }
        }

        const computedRole = isOwner ? "OWNER" : "CLIENT";

        try {
          user = await prisma.user.create({
            data: {
              clerkId: userData.clerkId,
              identifier: normalizedEmail || userData.clerkId,
              email: normalizedEmail,
              name: userData.name || null,
              phone: safePhone,
              role: computedRole,
              walletBalance: 0.0,
              wallet: {
                create: {
                  balance: 0.0,
                },
              },
            },
            include: { wallet: true },
          });
        } catch (createErr: any) {
          // Idempotent upsert: Handle concurrent creation or race condition
          if (createErr?.code === "P2002" || createErr?.message?.includes("Unique constraint")) {
            user = await prisma.user.findFirst({
              where: {
                OR: [
                  { clerkId: userData.clerkId },
                  ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
                ],
              },
              include: { wallet: true },
            });
            if (user) {
              let updatedRole = user.role;
              if (isOwner) {
                updatedRole = "OWNER";
              } else if (user.role === "OWNER") {
                console.warn(
                  `[SECURITY ANOMALY] User "${normalizedEmail || userData.clerkId}" had database role OWNER but does not match OWNER_EMAIL. Corrected to CLIENT.`
                );
                updatedRole = "CLIENT";
              }

              user = await prisma.user.update({
                where: { id: user.id },
                data: {
                  clerkId: userData.clerkId,
                  email: normalizedEmail || user.email,
                  name: userData.name || user.name,
                  role: updatedRole,
                },
                include: { wallet: true },
              });
            }
          } else {
            throw createErr;
          }
        }
      } else {
        // 5. If user already exists (found by clerkId or linked), update details and ensure wallet exists
        const updateData: any = {};
        if (userData.name !== undefined) updateData.name = userData.name;
        if (normalizedEmail !== null) updateData.email = normalizedEmail;

        if (isOwner) {
          if (user.role !== "OWNER") updateData.role = "OWNER";
        } else if (user.role === "OWNER") {
          console.warn(
            `[SECURITY ANOMALY] User "${normalizedEmail || userData.clerkId}" had database role OWNER but does not match OWNER_EMAIL. Corrected to CLIENT.`
          );
          updateData.role = "CLIENT";
        }

        if (userData.phone !== undefined) {
          const existingPhoneUser = userData.phone
            ? await prisma.user.findUnique({ where: { phone: userData.phone } })
            : null;
          if (!existingPhoneUser || existingPhoneUser.id === user.id) {
            updateData.phone = userData.phone;
          }
        }

        if (Object.keys(updateData).length > 0) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: updateData,
            include: { wallet: true },
          });
        }

        if (!user.wallet && (prisma as any).wallet) {
          try {
            const newWallet = await prisma.wallet.create({
              data: {
                userId: user.id,
                balance: user.walletBalance || 0.0,
              },
            });
            user.wallet = newWallet;
          } catch {
            // Ignore if created concurrently
          }
        }
      }

      return user;
    }
  } catch (err: any) {
    console.warn("User database sync notice:", err?.message || err);
  }

  // Graceful fallback representation if DB is offline during testing/dev preview
  return {
    id: `local_${userData.clerkId}`,
    clerkId: userData.clerkId,
    email: normalizedEmail,
    name: userData.name || null,
    role: isOwner ? "OWNER" : "CLIENT",
    walletBalance: 0.0,
  };
}

/**
 * Removes a user record from the database when deleted in Clerk.
 */
export async function deleteClerkUserFromDatabase(clerkId: string) {
  if (!clerkId) return null;
  try {
    if (prisma && (prisma as any).user) {
      return await prisma.user.deleteMany({
        where: { clerkId },
      });
    }
  } catch (err: any) {
    console.warn("User deletion notice:", err?.message || err);
  }
  return null;
}
