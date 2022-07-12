import { importx } from "@discordx/importer";
import { NotBot } from "@discordx/utilities";
import { Client } from "discordx";
import "dotenv/config";
import { DISCORD_ACTIVITY, DISCORD_INTENTS } from "./constants";
import { MessageOnError } from "./guards/messageOnError";
import { startReplitKeepalive } from "./replit";

startReplitKeepalive();
start().catch((error) => {
  console.error(error);
});

async function start() {
  const client = new Client({
    intents: DISCORD_INTENTS,
    botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
    silent: false,
    guards: [NotBot, MessageOnError],
  });

  client.once("ready", async () => {
    // Register guild commands for development
    await client.guilds.fetch();
    await client.initApplicationCommands();
    await client.initApplicationPermissions();

    // Set Discord activity
    client.user?.setActivity(DISCORD_ACTIVITY);

    // Alert console that bot is ready
    console.log(`Logged in as ${client.user?.tag || ""}!`);
  });

  // Setup discordx interaction handlers
  client.on("interactionCreate", (interaction) => {
    client.executeInteraction(interaction);
  });

  // Load all commands and event listeners
  await importx(`${__dirname}/commands/**/*`);
  await importx(`${__dirname}/listeners/**/*`);

  if (!process.env.BOT_TOKEN) {
    throw Error("BOT_TOKEN environment variable is not set");
  }
  await client.login(process.env.BOT_TOKEN);
}
