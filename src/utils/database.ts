import { User } from "@prisma/client";
import { prisma } from "../database/prisma";

export async function createOrGetUserById(id: string): Promise<User> {
  const existingUser = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (existingUser) {
    return existingUser;
  }

  return await prisma.user.create({
    data: {
      id,
    },
  });
}
