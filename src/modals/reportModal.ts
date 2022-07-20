import { ComponentType, EmbedBuilder, TextInputStyle } from "discord.js";
import { prisma } from "../database/prisma";
import { Modal } from "./modal";
import { UserModalStateType } from "./modalStateTypes";

export const reportModal = new Modal({
  id: "Report",
  defaultTitle: "Anonymously Report User",
  stateFields: {
    reportedUser: UserModalStateType(),
  },
  userInputFields: [
    {
      customId: "description",
      label: "Describe the issue",
      style: TextInputStyle.Paragraph,
      type: ComponentType.TextInput,
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
        new EmbedBuilder({
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
