var WebSocketServer = require('ws')
const DBConnector = require('../db/DBConnector');

module.exports = class WSConnector {

     

    static async connect(){
        this.WSS = new WebSocketServer.Server({port: 3250})
        await this.defaultData()
    }

    static async defaultData(){
        this.WSS.on("connection", async (ws,req)=>{
            var data = {}
            const latestQuizID = await DBConnector.getLatestQuizID()
            data.comments = await DBConnector.getComments(latestQuizID)
            data.quiz = await DBConnector.getQuiz(latestQuizID)

            ws.send(JSON.stringify(data))

            const bugFix = setInterval(()=>{
                ws.send(JSON.stringify({}))
            },2000)

        })
    }

    static async commentBroadcast(data){
        if(!this.WSS){
            await this.connect()
        }
        this.WSS.clients.forEach((client)=>{
            if(client.readyState == WebSocketServer.OPEN){
                client.send(JSON.stringify({comment:data}))
            }
        })
    }

    static async quizBroadcast(data){
        if(!this.WSS){
            await this.connect()
        }
        this.WSS.clients.forEach((client)=>{
            if(client.readyState == WebSocketServer.OPEN){
                client.send(JSON.stringify({quiz:data}))
            }
        })
    }

    static async moneyBroadcast(money){
        if(!this.WSS){
            await this.connect()
        }
        var data = {}
        data.money = money
        this.WSS.clients.forEach((client)=>{
            if(client.readyState == WebSocketServer.OPEN){
                client.send(JSON.stringify(data))
            }
        })
    }

}
