module.exports = {
    name: "messageCreate",
    async execute(message) {
      if (message.channel.id !== `1340546248918437919`) return;
      message.react(`<:sc_upvote:1240066343491866675>`);
      message.react(`<:sc_downvote:1240066368058167367>`);
    },
  };