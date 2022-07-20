import { ChannelType } from "discord.js";
import { ArgsOf, Discord, On } from "discordx";
import { prisma } from "../database/prisma";
import { createOrGetGuildConfig } from "../utils/databaseUtils";

@Discord()
class AutoWelcome {
  @On("guildMemberAdd")
  async onMemberJoin([member]: ArgsOf<"guildMemberAdd">) {
    const guildConfig = await createOrGetGuildConfig(member.guild.id);
    if (!guildConfig.welcomeChannelId) {
      return;
    }

    const welcomeChannel = member.guild.channels.cache.get(
      guildConfig.welcomeChannelId
    );
    if (!welcomeChannel || welcomeChannel.type !== ChannelType.GuildText) {
      return;
    }

    const welcomeMessages = await prisma.welcomeMessage.findMany();
    if (!welcomeMessages.length) {
      return;
    }

    const welcomeMessage =
      welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

    await welcomeChannel.send(
      welcomeMessage.content.replace(/{user}/g, member.toString())
    );
  }
}
