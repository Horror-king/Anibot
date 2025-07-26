const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

const botSignature = "💬 | SuNiTa Mia • Always here for you";

module.exports = {
  config: {
    name: "help",
    version: "2.1",
    author: "SuNiTa Mia Dev Team",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Graceful help menu by SuNiTa Mia",
    },
    longDescription: {
      en: "Get info and beautiful listing of all commands available",
    },
    category: "info",
    guide: {
      en: "{pn} / help <command>",
    },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID);

    if (args.length === 0) {
      const categories = {};
      let msg = `✨ 𝗦𝘂𝗡𝗶𝗧𝗮 𝗠𝗶𝗮 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗠𝗲𝗻𝘂 ✨\nYour personal assistant at your fingertips\n───────────────────────────────`;

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;

        const category = value.config.category || "Uncategorized";
        categories[category] = categories[category] || { commands: [] };
        categories[category].commands.push(name);
      }

      Object.keys(categories).forEach((category) => {
        msg += `\n\n📁 ${category.toUpperCase()}`;

        const names = categories[category].commands.sort();
        for (let i = 0; i < names.length; i += 3) {
          const cmds = names.slice(i, i + 3).map((cmd) => `🔹 ${cmd}`);
          msg += `\n${cmds.join("   ")}`;
        }
      });

      const totalCommands = commands.size;
      msg += `\n\n📦 Total Commands: ${totalCommands}`;
      msg += `\n💡 Use: ${prefix}help <command>`;
      msg += `\n───────────────────────────────\n${botSignature}`;

      await message.reply({
        body: msg,
      });
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        await message.reply(`⚠️ Command "${commandName}" not found.`);
      } else {
        const configCommand = command.config;
        const roleText = roleTextToString(configCommand.role);
        const author = configCommand.author || "Unknown";

        const longDescription = configCommand.longDescription?.en || "No description available.";
        const guideBody = configCommand.guide?.en || "No usage guide provided.";
        const usage = guideBody.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);

        const response = `✨ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗗𝗲𝘁𝗮𝗶𝗹𝘀 ✨

📌 Name: ${configCommand.name}
💡 Description: ${longDescription}
🔁 Aliases: ${configCommand.aliases ? configCommand.aliases.join(", ") : "None"}
👤 Required Role: ${roleText}
⏱️ Cooldown: ${configCommand.countDown || 1}s
🛠️ Version: ${configCommand.version || "1.0"}
🧑‍💻 Author: ${author}

🧠 Usage:
${usage}

📚 Notes:
• Use <...> for required values  
• Use [a|b|c] to choose from options

───────────────────────────────
${botSignature}`;

        await message.reply(response);
      }
    }
  },
};

function roleTextToString(roleText) {
  switch (roleText) {
    case 0:
      return "0 (Everyone)";
    case 1:
      return "1 (Group Admins)";
    case 2:
      return "2 (Bot Admin)";
    default:
      return "Unknown role";
  }
}
