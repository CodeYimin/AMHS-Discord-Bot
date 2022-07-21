import { ComponentType, TextInputStyle } from "discord.js";
import { prisma } from "./../database/prisma";
import { Modal } from "./modal";

export const createResponderModal = new Modal({
  id: "CreateResponder",
  defaultTitle: "Create a New Auto Responder",
  userInputFields: [
    {
      customId: "name",
      label: "Name",
      style: TextInputStyle.Short,
      type: ComponentType.TextInput,
      placeholder: "Short description of what this auto responder does...",
    },
    {
      customId: "triggerRegex",
      label: "Trigger Regex",
      style: TextInputStyle.Paragraph,
      type: ComponentType.TextInput,
    },
    {
      customId: "response",
      label: "Response",
      style: TextInputStyle.Paragraph,
      type: ComponentType.TextInput,
    },
  ],
  onSubmit: async (response) => {
    try {
      new RegExp(response.userInput.triggerRegex);
    } catch (e) {
      await response.interaction.reply({
        embeds: [
          {
            title: "Error!",
            description: "Please enter a valid regular expression.",
          },
        ],
      });
    }

    await prisma.autoResponder.create({
      data: {
        name: response.userInput.name,
        triggerRegex: response.userInput.triggerRegex,
        response: response.userInput.response,
      },
    });

    await response.interaction.reply({
      embeds: [
        {
          title: "Success!",
          description: `Successfully created new auto-responder, \`${response.userInput.name}\`.`,
        },
      ],
    });
  },
});
