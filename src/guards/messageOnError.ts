import { CommandInteraction, MessageEmbed } from "discord.js";
import { GuardFunction } from "discordx";
import { ErrorMessages } from "../constants";
import { replyOrFollowUp } from "../utils/replyOrFollowUp";

export const MessageOnError: GuardFunction<CommandInteraction> = (
  interaction,
  _client,
  next
) => {
  next().catch((error) => {
    console.error(error);
    const failEmbed = new MessageEmbed({
      description: ErrorMessages.UNKNOWN_ERROR,
    });

    replyOrFollowUp(interaction, { embeds: [failEmbed] }).catch(() => {
      // Do nothing
    });
  });
};
