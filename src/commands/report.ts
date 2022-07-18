import { MessageContextMenuInteraction } from "discord.js";
import { ContextMenu, Discord } from "discordx";
import { reportModal } from "../modals/reportModal";
import { createOrGetUserById } from "../utils/database";

@Discord()
class Report {
  @ContextMenu("MESSAGE", "Report")
  async messageHandler(interaction: MessageContextMenuInteraction) {
    const reportedUser = interaction.targetMessage.author;
    const reportedUserDb = await createOrGetUserById(reportedUser.id);

    await reportModal.show({
      interaction,
      title: `Anonymously Report User: ${reportedUser.username}`,
      state: {
        reportedUser: reportedUserDb,
      },
    });
  }
}
