module.exports = {
    name: "guildMemberRemove",
    async execute(member) {

        const channel = await member.guild.channels.cache.find(channel => channel.id === '1337545749235499018');
        await channel.fetch();
        channel.send(`${member.user} left`)
    },
};