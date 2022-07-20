import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
  User,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { createOrGetUser } from "../utils/databaseUtils";

@Discord()
class Profile {
  @Slash("profile", { description: "View your or someone else's AMHS profile" })
  async profile(
    @SlashOption("user", {
      type: ApplicationCommandOptionType.User,
      required: false,
      description: "The user to check the profile of. By default your own.",
    })
    user: User | undefined,

    interaction: CommandInteraction
  ) {
    const targetUser = user || interaction.user;
    const profile = await createOrGetUser(targetUser.id);

    const messageEmbed = new EmbedBuilder()
      .setTitle(profile.fullName || targetUser.username)
      .addFields({
        name: "Discord User",
        value: `<@${profile.id}>`,
        inline: true,
      });

    if (profile.graduated !== null) {
      messageEmbed.addFields({
        name: "Status",
        value: profile.graduated ? "Alum" : "Student",
        inline: true,
      });
    }
    if (profile.grade !== null) {
      messageEmbed.addFields({
        name: "Grade",
        value: profile.grade.toString(),
        inline: true,
      });
    }
    if (profile.teacher1) {
      messageEmbed.addFields({
        name: "Period 1 Teacher",
        value: profile.teacher1.toString(),
      });
    }
    if (profile.teacher2) {
      messageEmbed.addFields({
        name: "Period 2 Teacher",
        value: profile.teacher2.toString(),
      });
    }
    if (profile.teacher3) {
      messageEmbed.addFields({
        name: "Period 3 Teacher",
        value: profile.teacher3.toString(),
      });
    }
    if (profile.teacher4) {
      messageEmbed.addFields({
        name: "Period 4 Teacher",
        value: profile.teacher4.toString(),
      });
    }

    await interaction.reply({ embeds: [messageEmbed] });
  }
}
