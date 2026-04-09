import {
  Client, GatewayIntentBits, REST, Routes,
  SlashCommandBuilder, ChatInputCommandInteraction, Interaction,
} from "discord.js";
import { logger } from "./lib/logger";
import { addEntry } from "./dm-log";

const token = process.env["DISCORD_BOT_TOKEN"];
if (!token) throw new Error("DISCORD_BOT_TOKEN environment variable is required.");

const commands = [
  new SlashCommandBuilder()
    .setName("dm")
    .setDescription("Send a direct message to a Discord user")
    .addStringOption(o => o.setName("userid").setDescription("The Discord user ID").setRequired(true))
    .addStringOption(o => o.setName("message").setDescription("The message to send").setRequired(true))
    .toJSON(),
];

async function registerCommands(clientId: string) {
  const rest = new REST({ version: "10" }).setToken(token!);
  await rest.put(Routes.applicationCommands(clientId), { body: commands });
}

async function handleDm(interaction: ChatInputCommandInteraction) {
  const userId = interaction.options.getString("userid", true);
  const message = interaction.options.getString("message", true);
  await interaction.deferReply({ ephemeral: true });
  try {
    const user = await interaction.client.users.fetch(userId);
    await user.send(message);
    const reply = `Message sent to ${user.username} (${userId}) successfully.`;
    await interaction.editReply(`✅ ${reply}`);
    addEntry({ timestamp: new Date().toISOString(), userId, username: user.username, message, status: "success", reply });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Unknown error";
    const reply = `Failed to send message to user ${userId}: ${errMsg}`;
    await interaction.editReply(`❌ ${reply}`);
    addEntry({ timestamp: new Date().toISOString(), userId, username: null, message, status: "error", reply });
  }
}

export async function startBot() {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  client.once("ready", async c => { await registerCommands(c.user.id); });
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === "dm") await handleDm(interaction);
  });
  await client.login(token);
}
