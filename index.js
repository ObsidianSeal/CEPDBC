// *** much of this code is copied from Omega Seal ***

// IMPORT THINGS
const { tokenD, tokenE } = require("./secrets.json");
const { Client: DiscordClient, GatewayIntentBits, ActivityType, InteractionType, MessageFlags, EmbedBuilder } = require("discord.js");
const { Client: ExarotonClient } = require("exaroton");

// MAKE THE DISCORD CLIENT
const clientD = new DiscordClient({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages] });
clientD.login(tokenD);
clientD.once("ready", () => {
	console.log("\x1b[32mCEPDBC is now online!\n");
	clientD.user.setActivity({ name: "server.pinniped.page", type: ActivityType.Playing });
	clientD.channels.cache
		.get("1349835444740685835")
		.send(`## <:cepdbc:1373164311127523481> CEPDBC is now online! <:cepdbc:1373164311127523481>\n-# v0.0.1 @ ${Date.now()} = <t:${Math.round(Date.now() / 1000)}:R>`);
});

// MAKE THE EXAROTON CLIENT
const clientE = new ExarotonClient(tokenE);

let server = clientE.server("GWJB0vNi5atOcd1l");

// RESPOND TO SLASH COMMANDS
clientD.on("interactionCreate", async (interaction) => {
	if (interaction.type !== InteractionType.ApplicationCommand) return;
	const { commandName } = interaction;

	// "/ping" - send latency information
	if (commandName === "ping") {
		try {
			let botPing = Date.now() - interaction.createdTimestamp;
			let wsPing = clientD.ws.ping;

			await interaction.reply(`:ping_pong: **Pong!**\n> bot ping: \`${botPing}\`ms\n> API ping: \`${wsPing}\`ms`);

			commandLogMessage(interaction, `${botPing} & ${wsPing}`);
		} catch (error) {
			errorMessage(interaction, commandName, error);
		}
	}

	// "/server" - server details
	if (commandName === "server") {
		try {
			await server.get();
			let account = await clientE.getAccount();
			let serverRAM = await server.getRAM();

			let status = server.status;
			let statuses = {
				0: "OFFLINE",
				1: "ONLINE",
				2: "STARTING",
				3: "STOPPING",
				4: "RESTARTING",
				5: "SAVING",
				6: "LOADING",
				7: "CRASHED",
				8: "PENDING",
				9: "TRANSFERRING",
				10: "PREPARING",
			};
			let statusString = statuses[status];

			const serverDetailsEmbed = new EmbedBuilder()
				.setTitle("CIVIL ENGINEERS’ PARADISE  //  MINECRAFT SERVER STATUS")
				.setDescription(
					`<:cep:1373149617557995600> <t:${Math.round(
						Date.now() / 1000
					)}:R>\n\n:bulb: **STATUS:**\n${statusString}\n-# note: the server will automatically start if you join\n\n:jigsaw: **VERSION:**\n${
						server.software.version
					}\n-# the latest version of Minecraft: Java Edition\n\n:incoming_envelope: **IP:**\nserver.pinniped.page\n-# alternative IP: ${server.address} port ${
						server.port
					}\n\n:coin: **CREDITS REMAINING:**\n${account.credits} (about ${Math.round(
						account.credits / serverRAM
					)} hours of server use)\n-# basis for calculation: at ${serverRAM} GB RAM, ${serverRAM} credits are consumed hourly\n\n:scroll: **MESSAGE:**\n${
						server.motd
					}\n-# this is the server’s “MOTD” a.k.a. “message of the day”`
				)
				.setColor("#00aaaa");

			await interaction.reply({ embeds: [serverDetailsEmbed] });

			commandLogMessage(interaction, `...`);
		} catch (error) {
			errorMessage(interaction, commandName, error);
		}
	}

	// "/help" - help message
	if (commandName === "help") {
		try {
			await interaction.reply(
				":printer: **Command syntaxes and descriptions.**\n> `/ping` Latency information.\n> `/status` Check the Minecraft server’s status, version, and more.\n> `/help` Learn more about CEPDBC’s commands."
			);

			commandLogMessage(interaction, `...`);
		} catch (error) {
			errorMessage(interaction, commandName, error);
		}
	}
});

// UTILITY: LOG COMMAND USAGE TO CONSOLE
async function commandLogMessage(interaction, message) {
	let username = interaction.member.user.username;
	let displayName = interaction.member.user.displayName;
	console.log(`\x1b[35m> /${interaction.commandName}\x1b[37m — ${message} | ${displayName} (${username})`);
}

// UTILITY: ERROR RESPONSE & LOG TO CONSOLE
async function errorMessage(interaction, commandName, error) {
	await interaction.reply({
		content: `:fearful: Something went wrong....\n\`\`\`diff\n- ERROR!!\n- ${error}\n\`\`\`\n:bug: **Please report bugs!**\n> report issues here: [pinniped.page/contact](https://pinniped.page/contact)\n> for general <@1373131510936502283> help, use \`/help\``,
		flags: MessageFlags.Ephemeral,
	});
	console.log(`\x1b[31mERROR!! (/${commandName})`);
	console.log(error);
}

/*
 * colours (for the VSCode theme I use)
 * ----------------------------------------
 * RED = \x1b[31m (errors)
 * ORANGE = \x1b[34m (database updates)
 * YELLOW = \x1b[33m (special)
 * GREEN = \x1b[32m (successes)
 * BLUE = \x1b[36m (unused)
 * PURPLE = \x1b[35m (command logs)
 * reset = \x1b[37m
 */

console.log("\x1b[31m.\x1b[34m.\x1b[33m.\x1b[32m.\x1b[36m.\x1b[35m.\n");
