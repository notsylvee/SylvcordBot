module.exports = {
    name: "messageCreate",
    async execute(message) {
      if (!message.guild) return;
      if (message.channel.id !== `1221908615334461460`) return;
      if (message.content !== ("Hallo :D")) {message.delete()}
    },
  };