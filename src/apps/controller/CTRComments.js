const DBComments = require('../../db/DBComments');
const DBNicknames = require('../../db/DBNicknames')
const WSConnector = require('../../websocket/WSConnector');

exports.create = async (req, res) => {
  const axios = require('axios');
  var result

  // ip
  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  // nickname
  var nickname = await DBNicknames.getNicknameByIP(ip)
  if(nickname.length==0){
    result = await axios.get('http://rng.api.quizlunch.com/new');
    nickname = result.data
    await DBNicknames.insertNickname({ip:ip, name:nickname})
  }
  else{
    nickname = nickname[0].nickname
  }

  // time
  var today = new Date()
  var YYYY = today.getFullYear()
  var MM = ('0'+(today.getMonth()+1)).slice(-2)
  var DD = ('0'+(today.getDate())).slice(-2)
  var YYYYMMDD = `${YYYY}-${MM}-${DD}`

  var comment = {
    'quizID':req.body.quizID,
    'nickname':nickname,
    'password':req.body.password,
    'text':req.body.text,
    'ip':ip,
    'time':YYYYMMDD 
  }
  await DBComments.insertComment(comment)
  result = await DBComments.getIDByComment(comment)
  delete comment.password;
  comment.commentID = result[0].commentID
  WSConnector.broadcast('insert comment', comment)
  res.sendStatus(200)
}

exports.more = async (req, res) => {
  const result = await DBComments.getCommentsByQuizID(req.query.quizID, req.query.numOfComments)
  res.send(result)
}

exports.delete = async (req, res) => {
  const password = await DBComments.getPasswordByID(req.body.commentID)
  if(password[0].password == req.body.password){
    await DBComments.deleteCommentByID(req.body.commentID)
    WSConnector.broadcast('delete comment', req.body.commentID)
  }
  else{
    res.send(200,'wrong password');
  }
}


  
    

  