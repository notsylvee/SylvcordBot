module.exports = {
    name: "messageCreate",
    async execute(message) {
      if (message.channel.id !== `1219415504884731994`) return;
      if (message.author.id !== `729906911486672908`) return;
      message.react(`<:sc_downvote:1240066368058167367>`)
    },
  };