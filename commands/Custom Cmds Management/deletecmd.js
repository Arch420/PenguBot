const { Command } = require("klasa");

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            cooldown: 10,
            aliases: ["delcmd", "removecmd"],
            permLevel: 6,
            botPerms: ["USE_EXTERNAL_EMOJIS"],
            requiredConfigs: ["customcmds"],
            description: (msg) => msg.language.get("COMMAND_DEL_CMD_DESCRIPTION"),
            usage: "<name:string>",
            usageDelim: undefined,
            extendedHelp: "No extended help available."
        });
    }

    async run(msg, [name]) {
        const cmd = msg.guild.configs.customcmds.find(c => c.name === name);
        if (!cmd) return msg.reply(`<:penguError:435712890884849664> ***\`${name}\` ${msg.language.get("MESSAGE_CMD_NOTFOUND")}***`);
        await msg.guild.configs.update("customcmds", cmd, { action: `remove` });
        return msg.channel.send(`<:penguSuccess:435712876506775553> ***\`${name}\` ${msg.language.get("MESSAGE_CMD_REMOVED")} ${msg.author.tag}!***`);
    }

};