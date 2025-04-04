module.exports = {
    name: "guildMemberAdd",
    async execute(member) {

        if (member.user.bot) return;

        const memberRole = await member.guild.roles.cache.find(role => role.id === '1246702854568153129');
        //const OGRole = await member.guild.roles.cache.find(role => role.id === '1280059486454681623');
        await member.roles.add(memberRole);
        //await member.roles.add(OGRole);

        const channel = await member.guild.channels.cache.find(channel => channel.id === '1337545749235499018');
        await channel.fetch();
        channel.send(`${member.user}, welcome to Sylvcord!`)
    },
};