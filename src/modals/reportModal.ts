import {
  ChannelType,
  ComponentType,
  EmbedBuilder,
  TextInputStyle,
} from "discord.js";
import { prisma } from "../database/prisma";
import { createOrGetGuildConfig } from "../utils/databaseUtils";
import { Modal } from "./modal";
import { DbUserModalStateType } from "./modalStateTypes";

export const reportModal = new Modal({
  id: "Report",
  defaultTitle: "Anonymously Report User",
  stateFields: {
    reportedUser: DbUserModalStateType(),
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

    if (!response.interaction.guild) {
      return;
    }

    const guildConfig = await createOrGetGuildConfig(
      response.interaction.guild.id
    );
    if (!guildConfig.reportsChannelId) {
      return;
    }

    const reportsChannel = response.interaction.guild.channels.cache.get(
      guildConfig.reportsChannelId
    );
    if (!reportsChannel || reportsChannel.type !== ChannelType.GuildText) {
      return;
    }

    await reportsChannel.send({
      embeds: [
        new EmbedBuilder({
          title: "New Report",
          fields: [
            {
              name: "Reported User",
              value: `<@${response.state.reportedUser.id}>`,
            },
            {
              name: "Channel",
              value: response.interaction.channel?.toString() || "None",
            },
            {
              name: "Description",
              value: response.userInput.description,
            },
          ],
        }),
      ],
    });
  },
});
