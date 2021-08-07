const fs = require("fs")

const usersString = fs.readFileSync("db/users.json").toString()
let usersArray = JSON.parse(usersString)
const user3 = { "id": 3, "name": "jzhu", "password": 234231 }
usersArray.push(user3)

const string = JSON.stringify(usersArray)
fs.writeFileSync("db/users.json", string)

console.log(usersArray)