const { Argument } = require("klasa");
const Song = require("../lib/structures/Song");
const url = require("url");

// Regexes
const playlist = /(\?|\&)list=(.*)/i; // eslint-disable-line
const soundcloud = /https:\/\/soundcloud\.com\/.*/i;
const scPlaylist = /https:\/\/?soundcloud.com\/.*\/.*\/.*/i;
const wcSc = /scsearch:.*/;
const wcYt = /ytsearch:.*/;

module.exports = class extends Argument {

    async run(arg, possible, msg) {
        arg = arg.replace(/<(.+)>/g, "$1");
        if (!msg.guild) return null;

        const results = [];

        const isLink = this.isLink(arg);
        if (isLink) {
            if (playlist.exec(arg)) {
                const playlistResults = await this.getTracks(arg);
                if (!playlistResults[0]) throw msg.language.get("ER_MUSIC_NF");
                results.push(...playlistResults);
            } else if (soundcloud.exec(arg)) {
                if (scPlaylist.exec(arg)) {
                    const scPlaylistRes = await this.getTracks(arg);
                    if (!scPlaylistRes[0]) throw msg.language.get("ER_MUSIC_NF");
                    results.push(...scPlaylistRes);
                } else {
                    const scSingleRes = await this.getTracks(arg);
                    if (!scSingleRes) throw msg.language.get("ER_MUSIC_NF");
                    results.push(scSingleRes[0]);
                }
            } else {
                const httpRes = await this.getTracks(arg);
                if (!httpRes[0]) throw msg.language.get("ER_MUSIC_NF");
                results.push(httpRes[0]);
            }
        } else if (wcYt.exec(arg) || wcSc.exec(arg)) {
            const wildcardRes = await this.getTracks(arg);
            if (!wildcardRes[0]) throw msg.language.get("ER_MUSIC_NF");
            results.push(wildcardRes[0]);
        } else {
            let searchRes = await this.getTracks(`ytsearch:${arg}`);
            if (!searchRes[0]) searchRes = await this.getTracks(`scsearch:${arg}`);
            if (!searchRes[0]) throw "Could not find any search results on YouTube or SoundCloud, try again with a different name or provide a URL.";
            const options = searchRes.slice(0, 5);
            let index = 0;
            const selection = await msg.awaitReply([`🎵 | **Select a Song - PenguBot**\n`,
                `${options.map(o => `➡ \`${++index}\` ${o.info.title} - ${o.info.author} (${this.client.functions.friendlyDuration(o.info.length)})`).join("\n")}`,
                `\n${msg.author}, Please select an option by replying from range \`1-5\` to add it to the queue.`], 20000);
            try {
                if (selectedNo !== Number(selectedNo)) throw "<:penguError:435712890884849664> ***Invalid Option Selected, please select from `1-5`. Cancelled song selection.***";
                const selectedNo = Number(selection);
                if (selectedNo <= 0 || selectedNo > 5) throw "<:penguError:435712890884849664> ***Invalid Option Selected, please select from `1-5`. Cancelled song selection.***";
                results.push(searchRes[selectedNo - 1]);
            } catch (e) {
                throw "<:penguError:435712890884849664> ***No Option Selected, cancelled song selection.***";
            }
        }

        if (!results.length) throw msg.language.get("ER_MUSIC_NF");
        return results.map(track => new Song(track, msg.author));
    }

    /**
     * Gets an array of tracks from lavalink REST API
     * @param {string} search The search string
     * @returns {Array<Object>}
     */
    getTracks(search) {
        return this.client.lavalink.getSongs(search);
    }

    isLink(arg) {
        const res = url.parse(arg);
        const goodUrl = res.protocol && res.hostname;
        return goodUrl && (res.protocol === "https:" || res.protocol === "http:");
    }

};
