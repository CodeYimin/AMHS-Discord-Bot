import { CommandInteraction, MessageEmbed } from "discord.js";
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
    const graduated = grade === -1;
    const modalResponse = graduated
      ? await useAlumModal(interaction)
      : await useStudentModal(interaction);
    const updatedUser = await prisma.user.upsert({
      where: { id: interaction.user.id },
      create: {
        id: interaction.user.id,
      },
      update: {
        fullName: modalResponse.fields.fullName,
        graduated: graduated,
        grade: graduated ? undefined : grade,
        teacher1: modalResponse.fields.teacher1 || undefined,
        teacher2: modalResponse.fields.teacher2 || undefined,
        teacher3: modalResponse.fields.teacher3 || undefined,
        teacher4: modalResponse.fields.teacher4 || undefined,
      },
    });

    await modalResponse.interaction.reply({
      embeds: [
        new MessageEmbed({
          title: "Success",
          description: `${
            updatedUser.fullName
          }, you are now registered as an AMHS ${
            updatedUser.graduated ? "Alum" : "Student"
          }!`,
        }),
      ],
    });
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
