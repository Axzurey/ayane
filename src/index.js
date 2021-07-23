const Discord = require("discord.js")
require("dotenv").config()

const a = require("./ayane")
const ayane = new a()

const client = new Discord.Client()

async function m() {
    await ayane.load()
}
m()

client.on('message', async function(message) {
    if (message.author.bot) return
    let content = message.content
    let channel = message.channel
    let isSpam = await ayane.isSpam(content)
    let intent = await ayane.sendText(content)
    console.log(intent)
    message.reply(JSON.stringify({
        sentiment : intent.sentiment,
        answers : intent.answers,
        answer : intent.answer,
        intent : intent.intent,
        classifications : intent.classifications
    }, null, 4))
    if (isSpam == true) {
        message.reply("That message has been flagged as spam")
        return
    }
})

client.login(process.env.discordToken)