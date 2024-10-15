const { Client, GatewayIntentBits, ActivityType, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, Events, Partials, ChannelType, PermissionsBitField, Permissions, MessageManager, Embed, Collection, ButtonBuilder, ActionRowBuilder, ButtonStyle, DefaultDeviceProperty } = require(`discord.js`);
const fs = require('fs');
const internal = require('stream');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildPresences], partials: [Partials.Message, Partials.Channel, Partials.Reaction] }); 
const { createTranscript } = require('discord-html-transcripts');

client.commands = new Collection();

require('dotenv').config();

//MODMAIL VARIABLES:
let guildId = process.env.guildId;
let categoryId = process.env.categoryId;
let transcriptChannelId = process.env.transcriptChannelId;

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

(async () => {
    for (file of functions) {
        require(`./functions/${file}`)(client);
    }
    client.handleEvents(eventFiles, "./src/events");
    client.handleCommands(commandFolders, "./src/commands");
    client.login(process.env.token)
})();

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception:", err);
});

process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.log("Uncaught Exception Monitor", err, origin);
});

//MODMAIL
const modSchema = require('./Schemas/modschema');
client.on(Events.MessageCreate, async message => {

    if (message.author.bot) return;

    const guild = client.guilds.cache.get(guildId);

    if (message.channel.type == ChannelType.DM) {

        const member = message.author;

        let data = await modSchema.findOne({ Guild: guild.id, User: member});

        if (!data) {
            modSchema.create({
                Guild: guild.id,
                User: member.id
            })
        }

        const posChannel = guild.channels.cache.find(c => c.name === `${message.author.id}`);

        if (posChannel) {

            const embed = new EmbedBuilder()
            .setColor("0e1433")
            .setAuthor({ name: `${message.author.username}`, iconURL: `${message.author.displayAvatarURL()}`})
            .setDescription(`${message.content || 'No message provided'}`)

            if (message.attachments.size === 1) {
                embed.setImage(`${message.attachments.first()?.url}`);
            }

            posChannel.send({ embeds: [embed] });
            message.react(`✅`).catch(err => {return;})
            return;

        }

        const category = guild.channels.cache.get(categoryId);
        const channel = await guild.channels.create({
            name: message.author.id,
            type: ChannelType.GuildText,
            parent: category,
            topic: `A mail sent by ${message.author.tag}`
        })

        member?.send(`Your modmail conversation has been started in ${guild.name}`).catch(err => {
            return;
        })

        const embed = new EmbedBuilder()
        .setTitle(`NEW MODMAIL`)
        .setColor("0e1433")
        .setAuthor({ name: `${message.author.username}`, iconURL: `${message.author.displayAvatarURL()}`})
        .setDescription(`${message.content || 'No message provided'}`)
        .setTimestamp()
        .setFooter({ text: "Use the button below to close this mail"})

        if (message.attachments.size === 1) {
            try {
                embed.setImage(`${message.attachments.first()?.url}`);
            } catch {}
        }

        const button = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId('button')
            .setStyle(ButtonStyle.Danger)
            .setLabel('Close')
            .setEmoji('🔒')
        )

        if (message.attachments.size > 1) {

            let url = [];
                
            await Promise.all(message.attachments.map(async image => {
                url.push(image.url)
            }))

            const m = await channel.send({ embeds: [embed], components: [button], content: `${url.join('\n')}` });
            m.pin();
        } else {
            const m = await channel.send({ embeds: [embed], components: [button] });
            m.pin();
        }
        
        message.react(`✅`).catch(err => {return;})


    }
})

client.on(Events.MessageCreate, async message => {

    if (message.channel.type === ChannelType.GuildText) {

        const guild = client.guilds.cache.get(guildId);

        let data = await modSchema.findOne({ Guild: guild.id, User: message.channel.name});
        if (!data) return;

        const colChannel = guild.channels.cache.find(c => c.name === `${data.User}`);
        if (message.channel !== colChannel) return;
        if (message.author.bot) return;

        const memberID = data.User;
        const member = await client.users.fetch(memberID);

        const embed = new EmbedBuilder()
        .setColor("0e1433")
        .setAuthor({ name: `${message.author.username}`, iconURL: `${message.author.displayAvatarURL()}`})
        .setDescription(`${message.content || 'No message provided'}`)

        if (message.attachments.size === 1) {
            embed.setImage(`${message.attachments.first()?.url}`);
        }

        if (message.attachments.size > 1) {

            let url = [];
        
            await Promise.all(message.attachments.map(async image => {
                url.push(image.url)
            }))

            member?.send({ embeds: [embed], content: `${url.join('\n')}` }).catch(err => {
                return message.channel.send(`This user has their DMs off, I cannot dm them anything`)
            })

        }

        try {
            await member?.send({ embeds: [embed] });
            await message.react('✅');
        } catch {
            await message.react('❌');
        }

    }
})

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.guild) return;
    if (interaction.customId == 'button') {

        const modal = new ModalBuilder()
        .setTitle("Closing Reason")
        .setCustomId('modal')

        const reason = new TextInputBuilder()
        .setCustomId('reason')
        .setRequired(true)
        .setLabel("Reason for closing")
        .setStyle(TextInputStyle.Short);

        const firstActionRow = new ActionRowBuilder().addComponents(reason)

        modal.addComponents(firstActionRow)
        return interaction.showModal(modal)
    }

    if (!interaction.isModalSubmit()) return;

    let data = await modSchema.findOne({ Guild: interaction.guild.id, User: interaction.channel.name});
    if (!data) return;

    const user = await client.users.fetch(data.User).catch( () => {} );

    if (interaction.customId === 'modal') {
        const reason = interaction.fields.getTextInputValue('reason') || "No reason provided";

        await interaction.reply({
            embeds: [{
                title: `Modmail Closed`,
                description: `
This modmail has been closed!
**Moderator:** ${interaction.user}
**Reason:**
>>> ${reason}`,
                color: 0x0e1433
            }]
        });

        user?.send({
            embeds: [{
                title: `Modmail Closed`,
                description: `Your modmail conversation in ${interaction.guild.name} has been closed by a moderator. \n \nReason for closing: ${reason}`,
                color: 0x0e1433
            }]
        }).catch( async () => {
            await interaction.followUp({
                content: `I was unable to DM this user, they may have their DMs off!`,
            })
        });

        await new Promise(resolve => setTimeout(resolve, 5_000));

        const file = await createTranscript(interaction.channel, {
            limit: -1,
            returnBuffer: false,
            filename: `modmail-${interaction.channel.name}.html`,
        });

        let channel = client.channels.cache.get(transcriptChannelId);

        const tranembed = new EmbedBuilder()
        .setColor('0e1433')
        .setTimestamp()
        .setTitle(`${interaction.channel.name}'s Modmail Transcript`)
        .setDescription('> Your transcript has finished compiling!')

        let msg = await channel.send({ files: [file] });

        const button = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setLabel('• Open')
            .setURL(`https://mahto.id/chat-exporter?url=${msg.attachments.first()?.url}`)
            .setStyle(ButtonStyle.Link),

            new ButtonBuilder()
            .setLabel('• Download')
            .setURL(`${msg.attachments.first()?.url}`)
            .setStyle(ButtonStyle.Link)
        )

        await channel.send({ embeds: [tranembed], components: [button] });

        try {
            await interaction.channel.delete();
        } catch (error) {
            await interaction.channel.send({
                content: `I was unable to delete this channel, please delete it manually!`,
            })
        }
        
    }
})

