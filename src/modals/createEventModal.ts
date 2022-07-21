import { endOfDay, format, isExists, startOfDay } from "date-fns";
import { ComponentType, TextInputStyle } from "discord.js";
import { createOrGetUser } from "../utils/databaseUtils";
import { prisma } from "./../database/prisma";
import { Modal } from "./modal";

export const createEventModal = new Modal({
  id: "CreateEvent",
  defaultTitle: "Create a New Event",
  userInputFields: [
    {
      customId: "name",
      label: "Name",
      style: TextInputStyle.Short,
      type: ComponentType.TextInput,
    },
    {
      customId: "date",
      label: "Date",
      style: TextInputStyle.Short,
      type: ComponentType.TextInput,
      placeholder: "MM/DD/YYYY",
    },
    {
      customId: "time",
      label: "Time",
      style: TextInputStyle.Short,
      type: ComponentType.TextInput,
      placeholder: 'Eg. "16:00" or "18:00-22:00" or leave empty for all day',
      required: false,
    },
    {
      customId: "description",
      label: "Description",
      style: TextInputStyle.Paragraph,
      type: ComponentType.TextInput,
    },
  ],
  onSubmit: async (response) => {
    const dateRegex = /^(\d|\d{2})\/(\d|\d{2})\/(\d{4})$/;
    const singleTimeRegex = /^(?:[0-9]|0[0-9]|1[0-9]|2[0-3]):(?:[0-5][0-9])$/;
    const timeRangeRegex =
      /^((?:[0-9]|0[0-9]|1[0-9]|2[0-3]):(?:[0-5][0-9]))-((?:[0-9]|0[0-9]|1[0-9]|2[0-3]):(?:[0-5][0-9]))$/;

    const dateMatch = dateRegex.exec(response.userInput.date);
    const month = dateMatch ? parseInt(dateMatch[1]) : undefined;
    const day = dateMatch ? parseInt(dateMatch[2]) : undefined;
    const year = dateMatch ? parseInt(dateMatch[3]) : undefined;
    if (!dateMatch || !isExists(year!, month!, day!)) {
      await response.interaction.reply({
        embeds: [
          {
            title: "Error!",
            description: "Please enter a valid date.",
          },
        ],
        ephemeral: true,
      });
      return;
    }

    let startDateTime;
    let endDateTime;

    const singleTimeMatch = singleTimeRegex.exec(response.userInput.time);
    const timeRangeMatch = timeRangeRegex.exec(response.userInput.time);
    if (!response.userInput.time) {
      startDateTime = startOfDay(new Date(response.userInput.date));
      endDateTime = endOfDay(new Date(response.userInput.date));
    } else if (singleTimeMatch) {
      startDateTime = new Date(
        response.userInput.date + " " + response.userInput.time
      );
      endDateTime = startDateTime;
    } else if (timeRangeMatch) {
      startDateTime = new Date(
        response.userInput.date + " " + timeRangeMatch[1]
      );
      endDateTime = new Date(response.userInput.date + " " + timeRangeMatch[2]);
    } else {
      await response.interaction.reply({
        embeds: [
          {
            title: "Error!",
            description: "Please enter a valid time.",
          },
        ],
        ephemeral: true,
      });
      return;
    }

    const userDb = await createOrGetUser(response.interaction.user.id);

    await prisma.event.create({
      data: {
        name: response.userInput.name,
        description: response.userInput.description,
        startDateTime,
        endDateTime,
        private: true,
        creatorId: userDb.id,
        permittedUsers: {
          connect: {
            id: userDb.id,
          },
        },
      },
    });

    await response.interaction.reply({
      embeds: [
        {
          title: "Success!",
          description: `Successfully created a new event!`,
          fields: [
            {
              name: "Name",
              value: response.userInput.name,
            },
            {
              name: "Date",
              value: format(startDateTime, "iiii, MMMM do, Y"),
            },
            {
              name: "Time",
              value:
                +startDateTime === +endDateTime
                  ? format(startDateTime, "hh:mmaaa")
                  : +startDateTime === +startOfDay(startDateTime) &&
                    +endDateTime === +endOfDay(endDateTime)
                  ? "All day"
                  : `${format(startDateTime, "hh:mmaaa")} to ${format(
                      endDateTime,
                      "hh:mmaaa"
                    )}`,
            },
            {
              name: "Description",
              value: response.userInput.description,
            },
          ],
        },
      ],
    });
  },
});
