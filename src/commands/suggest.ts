import { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";
import { suggestionModal } from "../modals/suggestionModal";

@Discord()
class Suggest {
  @Slash("suggest", { description: "Create a suggestion for the server!" })
  async suggest(interaction: CommandInteraction) {
    await suggestionModal.show({
      interaction,
    });
  }
}
