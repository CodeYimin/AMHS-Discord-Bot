import { User } from "@prisma/client";
import {
  CommandInteraction,
  MessageEmbed,
  ModalSubmitInteraction,
} from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { prisma } from "../database/prisma";
import { useModal } from "../utils/modalUtils";
import { ModalInitiatorInteraction } from "./../utils/modalUtils";

@Discord()
class Register {
  @Slash("register", { description: "Register your AMHS profile." })
  async alum(
    @SlashChoice({ name: "Grade 9", value: 9 })
    @SlashChoice({ name: "Grade 10", value: 10 })
    @SlashChoice({ name: "Grade 11", value: 11 })
    @SlashChoice({ name: "Grade 12", value: 12 })
    @SlashChoice({ name: "Alum", value: -1 })
    @SlashOption("grade", {
      type: "INTEGER",
      description: "The grade you are currently in or going into.",
    })
    grade: number,
    interaction: CommandInteraction
  ) {
    const existingUser = await prisma.user.findUnique({
      where: { id: interaction.user.id },
    });
    if (existingUser) {
      const messageEmbed = new MessageEmbed({
        title: "Error",
        description: "You are already registered",
      });
      await interaction.reply({
        embeds: [messageEmbed],
        ephemeral: true,
      });
      return;
    }

    let newUser: User;
    let modalInteraction: ModalSubmitInteraction;

    const graduated = grade === -1;
    if (graduated) {
      const modalResponse = await useAlumModal(interaction);
      modalInteraction = modalResponse.interaction;

      newUser = await prisma.user.create({
        data: {
          id: interaction.user.id,
          fullName: modalResponse.fields.fullName,
          graduated: true,
        },
      });
    } else {
      const modalResponse = await useStudentModal(interaction);
      modalInteraction = modalResponse.interaction;

      newUser = await prisma.user.create({
        data: {
          id: interaction.user.id,
          fullName: modalResponse.fields.fullName,
          graduated: false,
          grade: grade,
          teacher1: modalResponse.fields.teacher1 || undefined,
          teacher2: modalResponse.fields.teacher2 || undefined,
          teacher3: modalResponse.fields.teacher3 || undefined,
          teacher4: modalResponse.fields.teacher4 || undefined,
        },
      });
    }

    const messageEmbed = new MessageEmbed({
      title: "Success",
      description: `${newUser.fullName}, you are now registered as an AMHS ${
        newUser.graduated ? "Alum" : "Student"
      }!`,
    });

    await modalInteraction.reply({ embeds: [messageEmbed] });
  }
}

function useAlumModal(interaction: ModalInitiatorInteraction) {
  return useModal({
    initiatorInteraction: interaction,
    title: "AMHS Alum Registration",
    components: [
      {
        customId: "fullName",
        label: "Full Name",
        style: "SHORT",
        required: true,
      },
    ],
  });
}

function useStudentModal(interaction: ModalInitiatorInteraction) {
  return useModal({
    initiatorInteraction: interaction,
    title: "AMHS Student Registration",
    components: [
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
  });
}
