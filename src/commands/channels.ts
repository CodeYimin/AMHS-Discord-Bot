import {
  ApplicationCommandOptionType,
  Channel,
  ChannelType,
  EmbedBuilder,
} from "discord.js";
import {
  Discord,
  Guard,
  Slash,
  SlashChoice,
  SlashGroup,
  SlashOption,
} from "discordx";
import { InGuild } from "../guards/inGuild";
import { createOrGetGuildConfig } from "../utils/databaseUtils";
import { prisma } from "./../database/prisma";
import { GuildCommandInteraction } from "./../guards/inGuild";

@Discord()
@Guard(InGuild)
@SlashGroup({
  name: "channels",
  description: "Configure various bot channels.",
})
@SlashGroup("channels")
class Channels {
  @Slash("view", { description: "Display the current channel configuration." })
  async current(interaction: GuildCommandInteraction) {
    const guildConfig = await createOrGetGuildConfig(interaction.guildId);

    await interaction.reply({
      embeds: [
        new EmbedBuilder({
          title: "Channel Configuration",
          fields: [
            {
              name: "Welcome Channel",
              value: guildConfig.welcomeChannelId
                ? `<#${guildConfig.welcomeChannelId}>`
                : "None",
            },
            {
              name: "Suggestions Channel",
              value: guildConfig.suggestionsChannelId
                ? `<#${guildConfig.suggestionsChannelId}>`
                : "None",
            },
            {
              name: "Reports Channel",
              value: guildConfig.reportsChannelId
                ? `<#${guildConfig.reportsChannelId}>`
                : "None",
            },
          ],
        }),
      ],
    });
  }

  @Slash("set", { description: "Set a specific channel." })
  @Guard(InGuild)
  async set(
    @SlashChoice({ name: "Welcome Channel", value: "Welcome" })
    @SlashChoice({ name: "Suggestions Channel", value: "Suggestions" })
    @SlashChoice({ name: "Reports Channel", value: "Report" })
    @SlashOption("channel_type", {
      description: "The type of channel to set.",
    })
    channelType: "Welcome" | "Suggestions" | "Report",

    @SlashOption("channel", {
      description: "The channel to set to.",
      type: ApplicationCommandOptionType.Channel,
    })
    channel: Channel,

    interaction: GuildCommandInteraction
  ) {
    if (channel.type !== ChannelType.GuildText) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder({
            title: "Error",
            description: "You must choose a text channel.",
          }),
        ],
        ephemeral: true,
      });
      return;
    }

    const guildConfig = await prisma.guildConfig.upsert({
      where: { id: interaction.guildId },
      create: { id: interaction.guildId },
      update:
        channelType === "Welcome"
          ? {
              welcomeChannelId: channel.id,
            }
          : channelType === "Suggestions"
          ? {
              suggestionsChannelId: channel.id,
            }
          : { reportsChannelId: channel.id },
    });

    await interaction.reply({
      embeds: [
        new EmbedBuilder({
          title: "Success",
          description: `Successfully changed ${channelType} channel to ${channel.toString()}`,
        }),
      ],
    });
  }
}
