const fs = require("fs")
const csv = require("csv-parser")

let results = []

async function x() {
    let end = new Promise((resolve, reject) => {
        fs.createReadStream('./spam1.csv')
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            resolve()
        })
    })
    await end
    let spam = []
    for (let i=0; i < results.length; i++) {
        let n = results[i]
        if (n.v1 == "ham") {
            spam.push(n.v2)
        }
    }
    fs.writeFileSync("./ham.json", JSON.stringify(spam, null, 4))
}
x()
