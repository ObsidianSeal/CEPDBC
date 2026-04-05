// *** much of this code is copied from Omega Seal ***

// IMPORT THINGS
const { tokenD, tokenE, botID } = require("./config.json");
const { Client: DiscordClient, GatewayIntentBits, ActivityType, InteractionType, MessageFlags, EmbedBuilder, PermissionOverwrites, PermissionsBitField } = require("discord.js");
const { Client: ExarotonClient } = require("exaroton");

// MAKE THE EXAROTON CLIENT
const clientE = new ExarotonClient(tokenE);

// THE MINECRAFT SERVER
let server = clientE.server("GWJB0vNi5atOcd1l");
let lastStatus,
	lastStatusUpdate = 0;
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

// MAKE & START THE DISCORD CLIENT
const clientD = new DiscordClient({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
clientD.login(tokenD);
clientD.once("clientReady", async () => {
	try {
		console.log("\x1b[32mCEPDBC is now online!\n");
		clientD.users.fetch("390612175137406978").then((user) => {
			user.send(`## <:cepdbc:1373164311127523481> CEPDBC is now online! <:cepdbc:1373164311127523481>\n-# v0.6 @ ${Date.now()} = <t:${Math.round(Date.now() / 1000)}:R>`);
		});

		await server.get();
		clientD.user.setActivity({ type: ActivityType.Streaming, name: `the server is ${statuses[server.status]}` });
		lastStatus = server.status;
		lastStatusUpdate = Date.now();
	} catch (error) {
		console.log(`\x1b[31mERROR!!\x1b[37m source: once "ready" [${formatDate(new Date())} ${formatTime(new Date())}]`);
		console.log(error);
	}
});

// MINECRAFT SERVER EVENTS
try {
	server.subscribe();
} catch (error) {
	console.log(`\x1b[31mERROR!!\x1b[37m source: subscribe(); [${formatDate(new Date())} ${formatTime(new Date())}]`);
	console.log(error);
}
server.on("status", async (server) => {
	try {
		if (server.status != lastStatus) {
			if (Date.now() - lastStatusUpdate > 1000) {
				clientD.user.setActivity({ type: ActivityType.Streaming, name: `the server is ${statuses[server.status]}` });
				lastStatusUpdate = Date.now();
			}

			if (server.status == server.STATUS.ONLINE) {
				clientD.channels.cache
					.get("1349764047234662503")
					.send(
						`## <:cep:1373149617557995600> Civil Engineers’ Paradise is now online! <:cep:1373149617557995600>\n-# someone started the server @ ${Date.now()} = <t:${Math.round(
							Date.now() / 1000,
						)}:R>\n-# use \`/server\` for more information`,
					);

				clientD.channels.cache.get("1373444936799617054").permissionOverwrites.edit("1349764046274170930", { SendMessages: true });
				clientD.channels.cache.get("1373444936799617054").send(":green_circle: This channel is now open.\n-# Messages sent here will appear on the server.");
			} else {
				clientD.channels.cache.get("1373444936799617054").permissionOverwrites.edit("1349764046274170930", { SendMessages: false });
				if (server.status == server.STATUS.OFFLINE) {
					clientD.channels.cache.get("1373444936799617054").send(":prohibited: This channel is now closed.\n-# The server is offline.");
				}
			}

			if (server.status == server.STATUS.OFFLINE) {
				let account = await clientE.getAccount();
				await server.setMOTD(
					`§3§lCivil Engineers’ Paradise§7 | §a§l${server.software.version}§7 | §d§l${
						Math.round(account.credits * 100) / 100
					} ☰\n§6> > >§e does the Discord bot work?`,
				);

				/*
				 * Minecraft format codes
				 * ----------------------------------------
				 * §0 = black = #000000
				 * §1 = dark_blue = #0000AA
				 * §2 = dark_green = #00AA00
				 * §3 = dark_aqua = #00AAAA
				 * §4 = dark_red = #AA0000
				 * §5 = dark_purple = #AA00AA
				 * §6 = gold = #FFAA00
				 * §7 = gray = #AAAAAA
				 * §8 = dark_gray = #555555
				 * §9 = blue = #5555FF
				 * §a = green = #55FF55
				 * §b = aqua = #55FFFF
				 * §c = red = #FF5555
				 * §d = light_purple = #FF55FF
				 * §e = yellow = #FFFF55
				 * §f = white = #FFFFFF
				 *
				 * §k = obfuscated/MTS*
				 * §l = bold
				 * §m = strikethrough
				 * §n = underline
				 * §o = italic
				 * §r = reset
				 *
				 * from https://minecraft.wiki/w/Formatting_codes
				 */
			}
		}

		lastStatus = server.status;
	} catch (error) {
		console.log(`\x1b[31mERROR!!\x1b[37m source: on "status" [${formatDate(new Date())} ${formatTime(new Date())}]`);
		console.log(error);
	}
});
try {
	server.subscribe("console");
} catch (error) {
	console.log(`\x1b[31mERROR!!\x1b[37m source: subscribe(console); [${formatDate(new Date())} ${formatTime(new Date())}]`);
	console.log(error);
}
server.on("console:line", async (line) => {
	try {
		line = line.line.replace(/^\[..:..:.. INFO\]: /, "");

		for (let player of server.players.list) {
			let testString = `<${player}>`;
			if (line.includes(testString)) {
				clientD.channels.cache
					.get("1373444936799617054")
					.send(
						`${line
							.substring(line.indexOf(testString))
							.replace(testString, `**${testString.substring(1, testString.length - 1)}** <t:${Math.round(Date.now() / 1000)}:R>`)}`,
					);

				console.log(`\x1b[36mmessage received from server:\x1b[37m ${line} [${formatDate(new Date())} ${formatTime(new Date())}]`);
			}
		}
	} catch (error) {
		console.log(`\x1b[31mERROR!!\x1b[37m source: on "console:line" [${formatDate(new Date())} ${formatTime(new Date())}]`);
		console.log(error);
	}
});
server.on("error", () => {
	console.log(`\x1b[31mERROR!!\x1b[37m source: on "error" [${formatDate(new Date())} ${formatTime(new Date())}]`);
});

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

			logMessage(interaction, `${botPing} & ${wsPing}`);
		} catch (error) {
			errorMessage(interaction, commandName, error);
			console.log(error);
		}
	}

	// "/start" - start the server
	if (commandName === "start") {
		try {
			if (server.status == server.STATUS.OFFLINE) {
				await server.start();

				await interaction.reply(`:airplane_departure: The server is now starting!\n-# use \`/server\` for more information`);
			} else if (server.status == server.STATUS.ONLINE) {
				await interaction.reply({
					content: `:open_mouth: The server is already online!\n-# use \`/server\` for more information`,
					flags: MessageFlags.Ephemeral,
				});
			} else {
				await interaction.reply({
					content: `:warning: This is not currently possible, please wait until the server is offline.\n-# use \`/server\` to check the server’s status`,
					flags: MessageFlags.Ephemeral,
				});
			}

			logMessage(interaction, `...`);
		} catch (error) {
			errorMessage(interaction, commandName, error);
			console.log(error);
		}
	}

	// "/server" - server details
	if (commandName === "server") {
		try {
			let account = await clientE.getAccount();
			let serverRAM = await server.getRAM();

			let status = server.status;
			let statusString = statuses[status];

			let playersString = "";
			let playerListString = "";
			if (status == server.STATUS.ONLINE) {
				playersString = ` — ${server.players.count}/${server.players.max} players`;
				if (server.players.count > 0) playerListString = `\n\n:farmer: **PLAYERS:**\n${server.players.list.join(", ")}\n-# usernames of online players`;
				else playerListString = `\n\n:farmer: **PLAYERS:**\n...\n-# the server is online, but empty`;
			}

			const serverDetailsEmbed = new EmbedBuilder()
				.setTitle("CIVIL ENGINEERS’ PARADISE  //  MINECRAFT SERVER STATUS")
				.setDescription(
					`<:cep:1373149617557995600> <t:${Math.round(
						Date.now() / 1000,
					)}:R>\n\n:bulb: **STATUS:**\n${statusString}${playersString}\n-# note: the server will automatically start if you join\n\n:jigsaw: **VERSION:**\n${
						server.software.version
					}\n-# the latest version of Minecraft: Java Edition\n\n:incoming_envelope: **IP:**\nserver.pinniped.page\n-# if that doesn’t work, try ${server.address}:${
						server.port
					}\n\n:coin: **CREDITS REMAINING:**\n${Math.round(account.credits * 100) / 100} (about ${Math.round(
						account.credits / serverRAM,
					)} hours of server use)\n-# basis for calculation: at ${serverRAM} GB RAM, ${serverRAM} credits are consumed hourly\n\n:scroll: **MESSAGE:**\n\`${server.motd
						.replaceAll(/§./g, "")
						.replaceAll(/\n/g, "`\n`")}\`\n-# this is the server’s “MOTD” a.k.a. “message of the day”${playerListString}`,
				)
				.setColor("#aabbcc");

			await interaction.reply({ embeds: [serverDetailsEmbed] });

			logMessage(interaction, `${statusString}`);
		} catch (error) {
			errorMessage(interaction, commandName, error);
			console.log(error);
		}
	}

	// "/help" - help message
	if (commandName === "help") {
		try {
			await interaction.reply(
				":printer: **Command syntaxes and descriptions.**\n> `/ping` Latency information.\n> `/start` Start the Minecraft server.\n> `/status` Check the Minecraft server’s status, version, and more.\n> `/help` Learn more about CEPDBC’s commands.",
			);

			logMessage(interaction, `...`);
		} catch (error) {
			errorMessage(interaction, commandName, error);
			console.log(error);
		}
	}
});

// SYNC DISCORD MESSAGES TO MINECRAFT SERVER
clientD.on("messageCreate", async (message) => {
	try {
		if (server.status == server.STATUS.ONLINE && message.channelId == "1373444936799617054" && !message.author.bot) {
			let name = message.member.nickname;
			if (name === null) name = message.author.displayName;

			server.executeCommand(
				`tellraw @a ["",{"text":"[","color":"gray"},{"text":"@${name}","color":"gold"},{"text":"]","color":"gray"},{"text":" ${message.content
					.replaceAll("\\", "\\\\")
					.replaceAll('"', '\\"')}"}]`,
			);

			console.log(`\x1b[36mmessage sent to server:\x1b[37m [@${name}] ${message.content} [${formatDate(new Date())} ${formatTime(new Date())}]`);
		}
	} catch (error) {
		console.log(`\x1b[31mERROR!!\x1b[37m source: on "messageCreate" [${formatDate(new Date())} ${formatTime(new Date())}]`);
		console.log(error);
	}
});

// UTILITY: FORMATE DATE FROM DATE
function formatDate(date) {
	let year = date.getFullYear();
	let month = date.getMonth() + 1;
	let day = date.getDate();

	return `${year}/${month.toString().padStart(2, "0")}/${day.toString().padStart(2, "0")}`;
}

// UTILITY: FORMATE TIME FROM DATE (COPIED FROM OMEGA SEAL, ADAPTED FROM THE GAME OF NUMBERS)
function formatTime(date) {
	let hour = date.getHours();
	let minute = date.getMinutes();
	let second = date.getSeconds();

	let half = "AM";
	if (hour >= 12) half = "PM";
	if (hour == 0) hour = 12;
	if (hour > 12) hour = hour % 12;

	return `${hour}:${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")} ${half}`;
}

// UTILITY: LOG INTERACTION
async function logMessage(interaction, message) {
	try {
		let name;
		if (interaction.inGuild()) name = interaction.user.username;
		else name = `\x1b[33m[DM]\x1b[37m ${interaction.user.username}`;

		console.log(`\x1b[35m> /${interaction.commandName}\x1b[37m — ${message} | ${name} [${formatDate(new Date())} ${formatTime(new Date())}]`);
	} catch (error) {
		console.log(`\x1b[31mERROR!!\x1b[37m source: logMessage(); [${formatDate(new Date())} ${formatTime(new Date())}]`);
		console.log(error);
	}
}

// UTILITY: LOG INTERACTION ERROR & SEND RESPONSE
async function errorMessage(interaction, commandName, error) {
	try {
		console.log(`\x1b[31mERROR!! (/${commandName}) [${formatDate(new Date())} ${formatTime(new Date())}]`);
		console.log(error);

		logMessage(interaction, "ERROR!!");

		await interaction.reply({
			content: `:fearful: Something went wrong....\n\`\`\`diff\n- ERROR!!\n- ${error}\n\`\`\`\n:bug: **Please report bugs!**\n> report issues here: [pinniped.page/contact](https://pinniped.page/contact)\n> for general <@${botID}}> help, use \`/help\``,
			flags: MessageFlags.Ephemeral,
		});
	} catch (error) {
		console.log(`\x1b[31mERROR!!\x1b[37m source: errorMessage(); [${formatDate(new Date())} ${formatTime(new Date())}]`);
		console.log(error);
	}
}

/*
 * colours (for the VSCode theme I use)
 * ----------------------------------------
 * RED = \x1b[31m (errors)
 * ORANGE = \x1b[34m (unused)
 * YELLOW = \x1b[33m (special)
 * GREEN = \x1b[32m (successes)
 * BLUE = \x1b[36m (message sync)
 * PURPLE = \x1b[35m (command logs)
 * reset = \x1b[37m
 */

console.log("\x1b[31m.\x1b[34m.\x1b[33m.\x1b[32m.\x1b[36m.\x1b[35m.\n");
