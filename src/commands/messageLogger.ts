import { CommandInteraction, MessageEmbed } from "discord.js";
import { Discord, Slash, SlashGroup } from "discordx";
import { prismaInstance } from "../database/prisma";

@Discord()
@SlashGroup({ name: "logger", description: "Message logger commands." })
@SlashGroup("logger")
class MessageLogger {
  @Slash("view", { description: "View all messages logged" })
  async view(interaction: CommandInteraction) {
    const messages = await prismaInstance.message.findMany();
    const messageEmbed = new MessageEmbed({
      description: messages
        .map((message) => `${message.id}: ${message.content}`)
        .join("\n"),
    });
    await interaction.reply({ embeds: [messageEmbed] });
  }
}
