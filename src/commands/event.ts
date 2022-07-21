import { CommandInteraction } from "discord.js";
import { Discord, Slash, SlashGroup } from "discordx";
import { createEventModal } from "./../modals/createEventModal";

@Discord()
@SlashGroup({ name: "event" })
@SlashGroup("event")
class Event {
  @Slash("view", { description: "View coming events." })
  async view(interaction: CommandInteraction) {
    //
  }

  @Slash("create", { description: "Create a new event." })
  async create(interaction: CommandInteraction) {
    await createEventModal.show({ interaction });
  }

  @Slash("remove", { description: "Remove an event." })
  async remove(interaction: CommandInteraction) {
    //
  }
}
