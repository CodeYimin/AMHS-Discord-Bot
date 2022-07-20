import { CommandInteraction } from "discord.js";
import { Discord, Slash, SlashGroup } from "discordx";

@Discord()
@SlashGroup({
  name: "channels",
  description: "Configure various bot channels.",
})
@SlashGroup("channels")
class Channels {
  @Slash("view", { description: "Display the current channel configuration." })
  async current(interaction: CommandInteraction) {}

  @Slash("set", { description: "Set a specific channel." })
  async set(interaction: CommandInteraction) {}
}
