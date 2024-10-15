module.exports = {
    name: "guildMemberAdd",
    async execute(member) {
        const role = await member.guild.roles.cache.find(role => role.id === '1246702854568153129');
        await member.roles.add(role);

        const channel = await member.guild.channels.cache.find(channel => channel.id === '1295777661477589114');
        await channel.fetch();
        channel.send(`${member.user}, welcome to Sylvcord!`)
    },
};