import { CommandInteraction, MessageEmbed, User } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { prisma } from "../database/prisma";

@Discord()
class Profile {
  @Slash("profile", { description: "View your or someone else's AMHS profile" })
  async profile(
    @SlashOption("user", {
      type: "USER",
      required: false,
      description: "The user to check the profile of. By default your own.",
    })
    user: User | undefined,

    interaction: CommandInteraction
  ) {
    const profile = await prisma.user.findUnique({
      where: {
        id: user?.id || interaction.user.id,
      },
    });

    if (!profile) {
      const messageEmbed = new MessageEmbed({
        title: "No profile found",
        description: `<@${
          user?.id || interaction.user.id
        }> did not register an AMHS profile.`,
      });

      await interaction.reply({ embeds: [messageEmbed] });
      return;
    }

    const messageEmbed = new MessageEmbed()
      .setTitle(profile.fullName)
      .addField("Discord User", `<@${profile.id}>`, true)
      .addField("Status", profile.graduated ? "Alum" : "Student", true);

    if (profile.grade) {
      messageEmbed.addField("Grade", profile.grade.toString(), true);
    }
    if (profile.teacher1) {
      messageEmbed.addField("Period 1 Teacher", profile.teacher1.toString());
    }
    if (profile.teacher2) {
      messageEmbed.addField("Period 2 Teacher", profile.teacher2.toString());
    }
    if (profile.teacher3) {
      messageEmbed.addField("Period 3 Teacher", profile.teacher3.toString());
    }
    if (profile.teacher4) {
      messageEmbed.addField("Period 4 Teacher", profile.teacher4.toString());
    }

    await interaction.reply({ embeds: [messageEmbed] });
  }
}
