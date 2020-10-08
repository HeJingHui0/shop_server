const express = require('express');
const router = express.Router();
const svgCaptcha = require('svg-captcha')
const smsUtil = require('../util/sms_util')
let md5 = require('blueimp-md5')

const conn = require('../db/db');

let users = {}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/*
  获取首页轮播图
*/
router.get('/api/homecasual', (req, res)=>{
   conn.query('SELECT * FROM shophomecasual', (error, results, fields) => {
      if(error) {
         res.json({
            error_code: 0,
            message: '请求失败'
         })
      }else {
         res.json({
            success_code: 200,
            message: results
         })
      }
   })
});
/*
 获取首页导航
*/
router.get('/api/homenav', (req, res)=>{
   conn.query('SELECT * FROM shophomenav', (error, results, fields) => {
      if(error) {
         res.json({
            error_code: 0,
            message: '请求失败'
         })
      }else {
         res.json({
            success_code: 200,
            message: results
         })
      }
   })
});
/*
 获取首页商品列表
*/
router.get('/api/homeshoplist', (req, res) => {
   const data = require('./../data/shopList');
   res.json({success_code: 200, message: data});
});
/*
 获取推荐商品列表
*/
router.get('/api/recommendshoplist', (req, res)=>{
   let pageIndex = req.query.pageIndex || 1
   let pageSize = req.query.pageSize || 20
   let sqlStr = 'SELECT * FROM shoprecommend LIMIT ' + (pageIndex - 1) * pageSize + ',' + pageSize
   conn.query(sqlStr, (error, results, fields) => {
      if(error) {
         res.json({
            error_code: 0,
            message: '请求失败'
         })
      }else {
         res.json({
            success_code: 200,
            message: results
         })
      }
   })
});
/*
 获取搜索分类列表
*/
router.get('/api/searchgoods', (req, res)=>{
   const data = require('./../data/search');
   res.json({success_code: 200, message: data});
});
/*
 图形验证码
*/
router.get('/api/captcha', (req, res)=>{
   let captcha = svgCaptcha.create({
      color: true,
      noise: 2,
      ignoreChars: 'o0i1',
      size: 4
   })
   req.session.captcha = captcha.text.toLocaleLowerCase()
   res.type('svg')
   res.send(captcha.data)
});
/*
 短信验证码
*/
router.get('/api/getcode', (req, res)=>{
   let phone = req.query.phone
   let code = smsUtil.randomCode(6)
   // smsUtil.sendCode(phone, code, function (success) {
   //    users[phone] = code
   //    res.json({success_code: 200, message: code})
   // })
   users[phone] = code
   res.json({success_code: 200, message: code})
});
/*
 手机验证码登录
*/
router.post('/api/login', (req, res)=>{
   let phone = req.body.phone
   let code = req.body.code
   if(users[phone] !== code) {
      res.json({success_code: 0, message: '验证码错误'})
      return
   }
   delete users[phone]
   let sqlStr = "SELECT * from shopusers WHERE userPhone = '" + phone + "'LIMIT 1"
   conn.query(sqlStr, (error, results, fields) => {
      if(error) {
         res.json({
            error_code: 0,
            message: '请求失败'
         })
      }else {
         results = JSON.parse(JSON.stringify(results))
         if(results[0]) {
            req.session.userId = results[0].id
            res.json({success_code: 200, message: {id: results[0].id, userName: results[0].userName, userPhone: results[0].userPhone}})
         }else {
            let addSql = "INSERT INTO shopusers(userName, userPhone) VALUES (?, ?)"
            let sqlParams = [phone, phone]
            conn.query(addSql, sqlParams, (error, results, fields) => {
               results = JSON.parse(JSON.stringify(results))
               if(!error) {
                  req.session.userId = results.insertId
                  let sqlStr = "SELECT * from shopusers WHERE id = '" + results.insertId + "'LIMIT 1"
                  conn.query(sqlStr, (error, results, fields) => {
                     if(error) {
                        res.json({
                           error_code: 0,
                           message: '请求失败'
                        })
                     }else {
                        results = JSON.parse(JSON.stringify(results))
                        res.json({success_code: 200, message: {id: results[0].id, userName: results[0].userName, userPhone: results[0].userPhone}})
                     }
                  })
               }
            })
         }
      }
   })
});
/*
 用户名密码登录
*/
router.post('/api/passwordlogin', (req, res)=>{
   let userName = req.body.userName
   let userPassword = md5(req.body.userPassword)
   let captcha = req.body.captcha.toLowerCase()
   // if(captcha !== req.session.captcha) {
   //    res.json({success_code: 0, message: '验证码错误'})
   //    return 
   // }
   delete req.session.captcha
   let sqlStr = "SELECT * from shopusers WHERE userName = '" + userName + "'LIMIT 1"
   conn.query(sqlStr, (error, results, fields) => {
      if(error) {
         res.json({
            error_code: 0,
            message: '用户名或密码错误'
         })
      }else {
         results = JSON.parse(JSON.stringify(results))
         if(results[0]) {
            if(results[0].userPassword !== userPassword) {
               res.json({
                  error_code: 0,
                  message: '用户名或密码错误'
               })
            }else {
               req.session.userId = results[0].id
               res.json({success_code: 200, message: {id: results[0].id, userName: results[0].userName, userPhone: results[0].userPhone}, info: '登录成功'})
            }
         }else {
            let addSql = "INSERT INTO shopusers(userName, userPassword) VALUES (?, ?)"
            let sqlParams = [userName, userPassword]
            conn.query(addSql, sqlParams, (error, results, fields) => {
               results = JSON.parse(JSON.stringify(results))
               if(!error) {
                  req.session.userId = results.insertId
                  let sqlStr = "SELECT * from shopusers WHERE id = '" + results.insertId + "'LIMIT 1"
                  conn.query(sqlStr, (error, results, fields) => {
                     if(error) {
                        res.json({
                           error_code: 0,
                           message: '请求失败'
                        })
                     }else {
                        results = JSON.parse(JSON.stringify(results))
                        res.json({success_code: 200, message: {id: results[0].id, userName: results[0].userName, userPhone: results[0].userPhone}})
                     }
                  })
               }
            })
         }
      }
   })
});
/*
 一小时内自动登录
*/
router.get('/api/user', (req, res)=>{
   let userId = req.session.userId
   let sqlStr = "SELECT * from shopusers WHERE id = '" + userId + "'LIMIT 1"
   conn.query(sqlStr, (error, results, fields) => {
      if(error) {
         res.json({
            error_code: 0,
            message: '请求失败'
         })
      }else {
         results = JSON.parse(JSON.stringify(results))
         if(!results[0]) {
            delete req.session.userId
            res.json({
               error_code: 0,
               message: '请先登录'
            })
         }else {
            res.json({success_code: 200, message: results[0]})
         }
      }
   })
});
/*
退出登录
*/
router.get('/api/logout', (req, res)=>{
   delete req.session.userId
   res.json({success_code: 200, message: '退出登录成功'})
});
/*
 修改用户信息
*/
router.post('/api/changeinfo', (req, res)=>{
   let userId = req.body.userId
   let userName = req.body.userName || ''
   let userSex = req.body.userSex || ''
   let userAddress = req.body.userAddress || ''
   let userBirthday = req.body.userBirthday || ''
   let userSign = req.body.userSign || ''
   if(!userId) {
      res.json({success_code: 0, message: '修改信息失败'})
   }
   let sqlStr = "UPDATE shopusers SET userName = ?, userSex = ?, userAddress = ?, userBirthday = ?, userSign = ? WHERE id = " + userId
   let sqlParams = [userName, userSex, userAddress, userBirthday, userSign]
   conn.query(sqlStr, sqlParams, (error, results, fields) => {
      if(error) {
         res.json({
            error_code: 0,
            message: '修改信息失败'
         })
      }else {
         res.json({
            success_code: 200,
            message: '修改信息成功'
         })
      }
   })

});

module.exports = router;
