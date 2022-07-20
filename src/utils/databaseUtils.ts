import { GuildConfig, User } from "@prisma/client";
import { prisma } from "../database/prisma";

export function createOrGetUser(id: string): Promise<User> {
  return prisma.user.upsert({
    where: { id },
    create: { id },
    update: {},
  });
}

export function createOrGetGuildConfig(id: string): Promise<GuildConfig> {
  return prisma.guildConfig.upsert({
    where: { id },
    create: { id },
    update: {},
  });
}
