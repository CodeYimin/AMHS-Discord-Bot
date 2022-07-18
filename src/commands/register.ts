import { CommandInteraction } from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import {
  alumRegisterModal,
  studentRegisterModal,
} from "../modals/registerModal";

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
    if (graduated) {
      await alumRegisterModal.show({
        interaction,
      });
    } else {
      await studentRegisterModal.show({
        interaction,
        state: { grade },
      });
    }
  }
}
