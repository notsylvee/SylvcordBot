module.exports = {
    name: "guildMemberRemove",
    async execute(member) {

        const channel = await member.guild.channels.cache.find(channel => channel.id === '1295777661477589114');
        await channel.fetch();
        channel.send(`${member.user} left`)
    },
};