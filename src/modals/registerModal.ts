import { MessageEmbed } from "discord.js";
import { prisma } from "../database/prisma";
import { Modal } from "./modal";
import { NumberModalStateType } from "./modalStateTypes";

export const studentRegisterModal = new Modal({
  id: "StudentRegistration",
  defaultTitle: "Student Registration",
  stateFields: {
    grade: NumberModalStateType(),
  },
  userInputFields: [
    {
      customId: "fullName",
      label: "Full Name",
      style: "SHORT",
      required: true,
    },
    {
      customId: "teacher1",
      label: "Period 1 Teacher",
      style: "SHORT",
    },
    {
      customId: "teacher2",
      label: "Period 2 Teacher",
      style: "SHORT",
    },
    {
      customId: "teacher3",
      label: "Period 3 Teacher",
      style: "SHORT",
    },
    {
      customId: "teacher4",
      label: "Period 4 Teacher",
      style: "SHORT",
    },
  ],
  onSubmit: async (response) => {
    const updatedUser = await prisma.user.upsert({
      where: { id: response.interaction.user.id },
      create: { id: response.interaction.user.id },
      update: {
        graduated: false,
        grade: response.state.grade,
        fullName: response.userInput.fullName,
        teacher1: response.userInput.teacher1 || null,
        teacher2: response.userInput.teacher2 || null,
        teacher3: response.userInput.teacher3 || null,
        teacher4: response.userInput.teacher4 || null,
      },
    });

    await response.interaction.reply({
      embeds: [
        new MessageEmbed({
          title: "Success",
          description: `${updatedUser.fullName}, you are now registered as an AMHS Student!`,
        }),
      ],
    });
  },
});

export const alumRegisterModal = new Modal({
  id: "AlumRegistration",
  defaultTitle: "Alum Registration",
  userInputFields: [
    {
      customId: "fullName",
      label: "Full Name",
      style: "SHORT",
      required: true,
    },
  ],
  onSubmit: async (response) => {
    const updatedUser = await prisma.user.upsert({
      where: { id: response.interaction.user.id },
      create: { id: response.interaction.user.id },
      update: {
        graduated: true,
        grade: null,
        fullName: response.userInput.fullName,
        teacher1: null,
        teacher2: null,
        teacher3: null,
        teacher4: null,
      },
    });

    await response.interaction.reply({
      embeds: [
        new MessageEmbed({
          title: "Success",
          description: `${updatedUser.fullName}, you are now registered as an AMHS Alum!`,
        }),
      ],
    });
  },
});
