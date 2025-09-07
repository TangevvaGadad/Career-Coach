// checkUser.ts
import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) return null;

  try {
    const existingUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (existingUser) return existingUser;

    const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0]?.emailAddress ?? "",
      },
    });

    return newUser;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("checkUser error:", error.message);
    } else {
      console.error("checkUser unknown error:", error);
    }
    return null;
  }
};
