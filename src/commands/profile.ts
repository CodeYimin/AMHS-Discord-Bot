import { CommandInteraction, MessageEmbed, User } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { createOrGetUserById } from "../utils/database";

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
    const targetUser = user || interaction.user;
    const profile = await createOrGetUserById(targetUser.id);

    const messageEmbed = new MessageEmbed()
      .setTitle(profile.fullName || targetUser.username)
      .addField("Discord User", `<@${profile.id}>`, true);

    if (profile.graduated !== null) {
      messageEmbed.addField(
        "Status",
        profile.graduated ? "Alum" : "Student",
        true
      );
    }
    if (profile.grade !== null) {
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
