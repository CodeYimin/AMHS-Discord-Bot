import {
  CommandInteraction,
  InteractionReplyOptions,
  MessageComponentInteraction,
  MessagePayload,
  ModalSubmitInteraction,
} from "discord.js";

export async function replyOrFollowUp(
  interaction:
    | CommandInteraction
    | MessageComponentInteraction
    | ModalSubmitInteraction,
  options: string | MessagePayload | InteractionReplyOptions
): Promise<void> {
  if (interaction.replied) {
    await interaction.followUp(options);
    return;
  }
  if (interaction.deferred) {
    await interaction.editReply(options);
    return;
  }
  await interaction.reply(options);
}
