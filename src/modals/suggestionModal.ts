import {
  ChannelType,
  ComponentType,
  EmbedBuilder,
  TextInputStyle,
} from "discord.js";
import { prisma } from "../database/prisma";
import { createOrGetGuildConfig } from "../utils/databaseUtils";
import { Modal } from "./modal";

export const suggestionModal = new Modal({
  id: "Suggestion",
  defaultTitle: "Create Suggestion",
  userInputFields: [
    {
      customId: "title",
      label: "Title",
      style: TextInputStyle.Short,
      type: ComponentType.TextInput,
      placeholder: "A brief summary of the suggestion...",
    },
    {
      customId: "description",
      label: "Description",
      style: TextInputStyle.Paragraph,
      type: ComponentType.TextInput,
      placeholder: "Describe the suggestion in depth...",
    },
  ],
  onSubmit: async (response) => {
    await prisma.suggestion.create({
      data: {
        creator: {
          connectOrCreate: {
            where: {
              id: response.interaction.user.id,
            },
            create: {
              id: response.interaction.user.id,
            },
          },
        },
        title: response.userInput.title,
        content: response.userInput.description,
      },
    });

    await response.interaction.reply({
      embeds: [
        new EmbedBuilder({
          title: "Thank you for your suggestion!",
          fields: [
            {
              name: "Title",
              value: response.userInput.title,
            },
            {
              name: "Description",
              value: response.userInput.description,
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
    if (!guildConfig.suggestionsChannelId) {
      return;
    }

    const suggestionsChannel = response.interaction.guild.channels.cache.get(
      guildConfig.suggestionsChannelId
    );
    if (
      !suggestionsChannel ||
      suggestionsChannel.type !== ChannelType.GuildText
    ) {
      return;
    }

    await suggestionsChannel.send({
      embeds: [
        new EmbedBuilder({
          title: `Suggestion: ${response.userInput.title}`,
          description: response.userInput.description,
          footer: {
            text: `Suggested by ${response.interaction.user.username}#${response.interaction.user.discriminator}`,
          },
        }),
      ],
    });
  },
});
