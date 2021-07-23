const { NlpManager } = require('node-nlp')
const csv = require('csv-parser')
const fs = require('fs')

class ayane {
    constructor() {
        this.config = {
            measureUnit : "ft"
        }
        this.info = {
            name : "ayane",
            age : 16,
            birthdate : "April 5th, 2005",
            gender : "female",
            height : 5.6,
            address : "the internet",
            parent : "Quasar",
            hobbies : "playing with my master and sleeping",
            colors : "purple and blue",
            species : "goddess"
        }
        this.responses = {
            "info.name" : [
                `My name is ${this.info.name}`, `I'm known as ${this.info.name}`, `I'm ${this.info.name}`
            ],
            "info.age" : [
                `I'm ${this.info.age} years old`, `I'm ${this.info.age}`, `I've been alive for ${this.info.age} years`
            ],
            "info.birthdate" : [
                `I was born on ${this.info.birthdate}`, `${this.info.birthdate}. That's when I was born`
            ],
            "info.gender" : [
                `I'm a ${this.info.gender}`, `${this.info.gender}. I'm a ${this.info.gender}`, `I'm ${this.info.gender}`
            ],
            "info.height" : [
                `I'm ${this.info.height}${this.config.measureUnit} tall`, `${this.info.height}${this.config.measureUnit} is my height`
            ],
            "info.address" : [
                `I live on ${this.info.address}`, `My home is ${this.info.address}, come over for a party some day`
            ],
            "info.parent" : [
                `${this.info.parent} is my master :)`, `The one who brought me into this world is ${this.info.parent} :)`
            ],
            "info.hobbies" : [
                `I enjoy ${this.info.hobbies}`, `My hobbies are ${this.info.hobbies}`
            ],
            "info.colors" : [
                `My favorite colors are ${this.info.colors}, In that order`, `${this.info.colors} are my favorite colors`
            ]
        }
        this.getEntities = async function(text) {
            let l = await self.sendText(text)
            return l.entities
        }
        this.isSpam = async function(text) {
            let l = await this.sendText(text)
            for (let i=0; i < l.classifications.length; i++) {
                let n = l.classifications[i]
                if (n.intent == "spam" && n.score >= .75) {
                    return true, n.score
                }
                else if (n.intent == "spam" && n.score < .75){
                    return false, n.score
                }
            }
            return false, null
        }
        this.intentManager = new NlpManager({ languages: ['en'], forceNER: true })
        this.train = async function() {
            await this.intentManager.train()
            this.intentManager.save()
        }
        this.intents = {}
        this.intents.general = require("./database/intents.json")
        this.intents.spam = require("./database/spam.json")
        this.intents.ham = require("./database/ham.json")

        this.filler = {}
        this.filler.name = require("./database/names.json")

        this.fill = function(str, dir, count) {
            let n = []
            console.log("iter begin")
            for (let i = 0; i < this.filler[dir].length && i < count; i ++) {
                let index = this.filler[dir][i]
                let newString = str.replace(`%${dir}`, index)
                if (newString != str) {
                    n.push(newString)
                    console.log(newString)
                }
            }
            return n
        }
        this.loadGreetings = function() {
            for (const [index, value] of Object.entries(this.intents.general)) { //iterate object
                for (let i = 0; i < value.length; i++) { //iterate value
                    let t = this.fill(value[i], "name", 15)
                    for (let i=0; i < t.length; i++) {
                        console.log(t[i])
                        this.intentManager.addDocument("en", t[i], index)
                    }
                }
            }
            for (let i = 0; i < this.intents.spam.length; i++) {
                this.intentManager.addDocument("en", this.intents.spam[i], "spam")
            }
            for (let i = 0; i < this.intents.ham.length; i++) {
                this.intentManager.addDocument("en", this.intents.ham[i], "ham")
            }

            this.intentManager.addAnswer('en', 'bye', 'see you later!')
            this.intentManager.addAnswer('en', 'bye', "I'll miss you ♥")
            this.intentManager.addAnswer('en', 'hello', 'Hello master!')
            this.intentManager.addAnswer('en', 'hello', "hey, what can I do for you?")
        }
        this.load = async function() {
            this.loadGreetings()
            await this.train()
        }
        this.sendText = async function(text) {
            const response = await this.intentManager.process("en", text)
            return response
        }
    }
}

module.exports = ayane