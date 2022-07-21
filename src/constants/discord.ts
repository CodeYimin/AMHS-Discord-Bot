import { ActivityOptions, ActivityType, ClientOptions } from "discord.js";

export const DISCORD_ACTIVITY: ActivityOptions = {
  name: "with a new discord bot",
  type: ActivityType.Playing,
};

export const DISCORD_INTENTS: ClientOptions["intents"] = [
  "Guilds",
  "GuildMessages",
  "MessageContent",
];
