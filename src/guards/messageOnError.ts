import { CommandInteraction, EmbedBuilder } from "discord.js";
import { GuardFunction } from "discordx";
import { ErrorMessages } from "../constants";
import { replyOrFollowUp } from "../utils/messageUtils";

export const MessageOnError: GuardFunction<CommandInteraction> = (
  interaction,
  _client,
  next
) => {
  next().catch((error) => {
    console.error(error);
    const failEmbed = new EmbedBuilder({
      description: ErrorMessages.UNKNOWN_ERROR,
    });

    replyOrFollowUp(interaction, {
      embeds: [failEmbed],
      ephemeral: true,
    }).catch(() => {
      // Do nothing
    });
  });
};
