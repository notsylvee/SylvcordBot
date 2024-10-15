const mongoose = require('mongoose')
const mongodbURL = process.env.MONGODBURL;
const { ActivityType } = require("discord.js");

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        client.user.setPresence({
            status: "idle",
            activities: [
              {
                type: ActivityType.Custom,
                name: "customstatus",
                state: "DM for modmail!",
              },
            ],
          });

        console.log('Ready!');

        if (!mongodbURL) return;

        mongoose.set('strictQuery', false);

        await mongoose.connect(mongodbURL || '', {
            //keepAlive: true,
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        if (mongoose.connect) {
            mongoose.set('strictQuery', true);
            console.log("The database is running!")
        }

    }
};
