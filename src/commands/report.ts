import { MessageContextMenuInteraction, MessageEmbed } from "discord.js";
import { ContextMenu, Discord } from "discordx";
import { prisma } from "../database/prisma";
import { useModal } from "../utils/modalUtils";

@Discord()
class Report {
  @ContextMenu("MESSAGE", "Report")
  async messageHandler(interaction: MessageContextMenuInteraction) {
    const reportedUser = interaction.targetMessage.author;

    const modalResponse = await useModal({
      initiatorInteraction: interaction,
      title: `Report Message from ${reportedUser.username}`,
      components: [
        {
          customId: "description",
          label: "Describe the issue",
          style: "PARAGRAPH",
        },
      ],
    });

    const report = await prisma.report.create({
      data: {
        reportedUser: {
          connectOrCreate: {
            where: { id: reportedUser.id },
            create: { id: reportedUser.id },
          },
        },
        content: modalResponse.fields.description,
      },
    });

    await modalResponse.interaction.reply({
      embeds: [
        new MessageEmbed({
          title: "Thank you for reporting!",
          fields: [{ name: "Reported User", value: `<@${reportedUser.id}>` }],
        }),
      ],
      ephemeral: true,
    });
  }
}
