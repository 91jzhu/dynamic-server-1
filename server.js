var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if (!port) {
    console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
    process.exit(1)
}

var server = http.createServer(function (request, response) {
    var parsedUrl = url.parse(request.url, true)
    var pathWithQuery = request.url
    var queryString = ''
    if (pathWithQuery.indexOf('?') >= 0) { queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
    var path = parsedUrl.pathname
    var query = parsedUrl.query
    var method = request.method

    /******** 从这里开始看，上面不要看 ************/

    console.log('有个傻子发请求过来啦！路径（带查询参数）为：' + pathWithQuery)

    if (path === "/signin" && method === "POST") {
        response.setHeader("Conteng-Type", "text/json;charset=UTF-8")
        let DB = JSON.parse(fs.readFileSync("db/users.json"))
        let array = []
        request.on("data", (chunk) => {
            array.push(chunk)
        })
        request.on("end", () => {
            const string = Buffer.concat(array).toString()
            const obj = JSON.parse(string)
            const user = DB.find((user) => { user.name === obj.name && user.password === obj.password })
            if (user === undefined) {
                response.statusCode = 400
                response.setHeader("Conteng-Type", "text/json;charset=UTF-8")
                response.end(`{"errorCode":531}`)
            } else {
                response.statusCode = 200
                response.setHeader("Set-Cookie", "logined=1")
                response.end()
            }
        })

    }
    else if (path === "/home.html") {
        response.end("home")
    }
    else if (path === "/signup" && method === "POST") {
        let DB = JSON.parse(fs.readFileSync("db/users.json"))
        response.setHeader("Conteng-Type", "text/json;charset=UTF-8")
        let array = []
        request.on("data", (chunk) => {
            array.push(chunk)
        })
        request.on("end", () => {
            const string = Buffer.concat(array).toString()
            const obj = JSON.parse(string)
            let lastUser = DB[DB.length - 1]
            const newUser = {
                id: lastUser ? lastUser.id + 1 : 1,
                name: obj.name,
                password: obj.password
            }
            DB.push(newUser)
            fs.writeFileSync("db/users.json", JSON.stringify(DB))
            response.end()
        })


    } else {
        response.statusCode = 200
        const filePath = path === "/" ? "/index.html" : path
        const index = filePath.lastIndexOf(".")
        const suffix = filePath.substring(index)
        let fileTypes = {
            ".html": "text/html",
            ".css": "text/css",
            ".js": "text/javascript",
            ".png": "image/png",
            ".jpg": "image/jpeg"
        }
        response.setHeader('Content-Type', `${fileTypes[suffix] || "text/index.html"};charset=utf-8`)
        console.log(suffix)
        console.log(fileTypes)
        let content
        try {
            content = fs.readFileSync(`public${filePath}`)
        } catch (error) {
            content = "文件不存在"
            response.statusCode = 404
        }
        response.write(content)
        response.end()
    }

    // if (path === '/' || path === "/index.html") {
    //     response.statusCode = 200
    //     response.setHeader('Content-Type', 'text/html;charset=utf-8')
    //     response.write(fs.readFileSync("public/index.html"))
    //     response.end()
    // } else if (path === '/style.css') {
    //     response.statusCode = 200
    //     response.setHeader('Content-Type', 'text/css;charset=utf-8')
    //     response.write(fs.readFileSync("public/style.css"))
    //     response.end()
    // } else {
    //     response.statusCode = 404
    //     response.setHeader('Content-Type', 'text/html;charset=utf-8')
    //     response.write(`你输入的路径不存在对应的内容`)
    //     response.end()
    // }

    /******** 代码结束，下面不要看 ************/
})

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)