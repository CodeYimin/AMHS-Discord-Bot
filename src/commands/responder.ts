import { CommandInteraction } from "discord.js";
import { Discord, Slash, SlashGroup } from "discordx";
import { prisma } from "./../database/prisma";
import { createResponderModal } from "./../modals/createResponderModal";

@Discord()
@SlashGroup({ name: "responder" })
@SlashGroup("responder")
class Responder {
  @Slash("view", { description: "View a list of the current auto-responders." })
  async view(interaction: CommandInteraction) {
    const responders = await prisma.autoResponder.findMany();

    await interaction.reply({
      embeds: [
        {
          title: "Not implemented",
        },
      ],
    });
  }

  @Slash("add", { description: "Create a new auto-responder" })
  async add(interaction: CommandInteraction) {
    await createResponderModal.show({ interaction });
  }
}
