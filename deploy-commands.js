// IMPORT THINGS
const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { tokenD, botID } = require("./config.json");

// MAKE COMMANDS
const commands = [
	// "/ping"
	new SlashCommandBuilder().setName("ping").setDescription("Latency information."),

	// "start"
	new SlashCommandBuilder().setName("start").setDescription("Start the Minecraft server."),

	// "server"
	new SlashCommandBuilder().setName("server").setDescription("Check the Minecraft server’s status, version, and more."),

	// "/help"
	new SlashCommandBuilder().setName("help").setDescription("Learn more about CEPDBC’s commands."),
].map((command) => command.toJSON());

const rest = new REST().setToken(tokenD);

// SEND THE COMMANDS TO DISCORD
rest.put(Routes.applicationCommands(botID), { body: commands }) // use "body: []" to remove all; requires re-adding the bot to servers after commands are restored
	.then(() => console.log("\x1b[32mCEPDBC’s “application commands” have successfully been registered with Discord."))
	.catch(console.error);

// DELETE A COMMAND
// let commandID = 0;
// rest.delete(Routes.applicationCommands(botID, commandID))
// 	.then(() => console.log(`\x1b[32m${commandID} has successfully been deleted from Discord.`))
// 	.catch(console.error);
