import { ActivityOptions, ClientOptions } from "discord.js";

export const DISCORD_ACTIVITY: ActivityOptions = {
  name: "with a new discord bot",
  type: "PLAYING",
};

export const DISCORD_INTENTS: ClientOptions["intents"] = [
  "GUILDS",
  "GUILD_MESSAGES",
];
