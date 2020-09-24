const express = require('express');
const router = express.Router();

const conn = require('../db/db')

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

module.exports = router;
