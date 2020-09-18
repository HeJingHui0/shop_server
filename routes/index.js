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
  const data = require('./../data/homecasual');
  res.json(data);
});
/*
 获取首页导航
*/
router.get('/api/homenav', (req, res)=>{
   const navJson = require('./../data/homenav');
   res.json({success_code: 200, message: navJson.data});
});
/*
 获取首页商品列表
*/
router.get('/api/homeshoplist', (req, res)=>{
   const data = require('./../data/shopList');
   res.json({success_code: 200, message: data});
});
/*
 获取搜索分类列表
*/
router.get('/api/searchgoods', (req, res)=>{
   const data = require('./../data/search');
   res.json({success_code: 200, message: data});
});

module.exports = router;