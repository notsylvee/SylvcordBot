const { EmbedBuilder } = require("@discordjs/builders");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("confess")
    .setDescription("Make an anonymous confession")
    .addStringOption((option) => option.setName("confession").setDescription("the confession you want to make").setRequired(true)),
    async execute (interaction, client) {
        const { options } = interaction;
        const confession = options.getString("confession");
        const confesschannel = await client.channels.fetch("1295575217195843584");

        const embed = new EmbedBuilder()
        .setColor(0x0e1433)
        .setTitle("Anonymous Confession")
        .setDescription(`"${confession}"`)
        .setTimestamp();

        await confesschannel.send({ embeds: [embed] });
        await interaction.reply({ content: "Confession sent", ephemeral: true });
    }
};