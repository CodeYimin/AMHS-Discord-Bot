import { CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";

@Discord()
class Message {
  @Slash("message")
  async message(
    @SlashOption("content", { description: "The message content to send" })
    content: string,
    interaction: CommandInteraction
  ) {
    await interaction.reply(content);
  }
}
