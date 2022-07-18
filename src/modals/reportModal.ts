import { MessageEmbed } from "discord.js";
import { prisma } from "../database/prisma";
import { Modal } from "./modal";
import { UserModalStateType } from "./modalStateTypes";

export const reportModal = new Modal({
  id: "Report",
  defaultTitle: "Anonymously Report User",
  stateFields: [
    {
      name: "reportedUser",
      type: UserModalStateType(),
    },
  ],
  userInputFields: [
    {
      customId: "description",
      label: "Describe the issue",
      style: "PARAGRAPH",
      required: true,
    },
  ],
  onSubmit: async (response) => {
    await prisma.report.create({
      data: {
        reportedUserId: response.state.reportedUser.id,
        content: response.userInput.description,
      },
    });

    await response.interaction.reply({
      embeds: [
        new MessageEmbed({
          title: "Thank you for reporting!",
          fields: [
            {
              name: "Reported User",
              value: `<@${response.state.reportedUser.id}>`,
            },
          ],
        }),
      ],
      ephemeral: true,
    });
  },
});
