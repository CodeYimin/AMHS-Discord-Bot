import {
  ApplicationCommandType,
  MessageContextMenuCommandInteraction,
} from "discord.js";
import { ContextMenu, Discord } from "discordx";
import { reportModal } from "../modals/reportModal";
import { createOrGetUser } from "../utils/databaseUtils";

@Discord()
class Report {
  @ContextMenu(ApplicationCommandType.Message, "Report")
  async messageHandler(interaction: MessageContextMenuCommandInteraction) {
    const reportedUser = interaction.targetMessage.author;
    const reportedUserDb = await createOrGetUser(reportedUser.id);

    await reportModal.show({
      interaction,
      title: `Anonymously Report User: ${reportedUser.username}`,
      state: {
        reportedUser: reportedUserDb,
      },
    });
  }
}
