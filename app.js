const feathers = require("@feathersjs/feathers");
const express = require("@feathersjs/express");
const socketio = require("@feathersjs/socketio");

class MessageService {
  constructor() {
    this.messages = [];
  }

  async find() {
    return this.messages;
  }

  async create({ text }) {
    const message = {
      id: this.messages.length,
      text
    };

    this.messages.push(message);

    return message;
  }
}

const app = express(feathers());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.configure(express.rest());
app.configure(socketio());

app.use("/messages", new MessageService());

app.use(express.errorHandler());

app.on("connection", connection => {
  app.channel("everybody").join(connection);
});

app.publish(() => app.channel("everybody"));

app.listen(3000).on("listening", () => {
  console.log("Server running on 3000");
});

app.service("messages").create({
  text: "Aha....."
});

app.service("messages").on("created", message => {
  console.log("New message", message);
});

const main = async () => {
  await app.service("messages").create({
    text: "Hello Feathers"
  });

  await app.service("messages").create({
    text: "Hello Again!"
  });

  const messages = await app.service("messages").find();

  console.log("All messages", messages);
};

main();
