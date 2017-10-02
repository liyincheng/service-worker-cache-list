#! /usr/bin/env node

//import fetch from 'node-fetch';
const fetch = require("node-fetch-npm");
const parser = require('cheerio');
const argv = require('optimist').argv;
const fs = require("fs");
const urlParser = require("url");

if (!argv.url) {
    console.log(
`usage1: sw-cache --url=https://github.com
usage2: sw-cache --url=https://github.com #the url to fetch
                 --res=img,css,js  # the resource type to cache in service worker json file
                 --cache-pah=cache-json
                 --page-name=home        # the manifest/html file name
                 --disable-domain=test1.com,test2.com    # not cache domain which not support CROS
`);
    return;
}

if (argv.url.indexOf("http://") < 0 && argv.url.indexOf("https://") < 0) {
    console.log("\nError: url is illeage, which should begin with http:// or https://\n");
    return;
}

let util = {
    /*
     * @return {String} 当前时间的字符串形式
     */
    getDateStr () {
        return (new Date()).toLocaleString();
    },

    /*
     * 获取url的hostname
     */
    getHostName (urlAddr) {
        let url = urlParser.parse(urlAddr);
        return url.hostname || config.url.hostname;
    },

    /*
     * @return {String} 当前页面名称
     */
    getPageName (){
        let url = urlParser.parse(argv.url);
        let path = url.path.replace(/\/$/, "");
        // 首页
        if (!path) {
            return "home";
        } else {
        // 其它页面取最后一个/后的内容
            let pathArray = path.split("/");
            return pathArray[pathArray.length - 1]; 
        }
    },

    /*
     * 判断一个目录是否存在
     * @param {String} dirPath 目录的路径
     */
    dirExists (dirPath){
        try{
            return fs.statSync(dirPath).isDirectory();
        } catch (err) {
            return false;
        }
    },

    /*
     * 创建html/appcache的目录
     * @param {String} dirPath 目录的路径
     */
    createDir (dirPath) {
        if (!util.dirExists(dirPath)){
            fs.mkdirSync(dirPath);
        } 
    }

};


var config = {
    url: require("url").parse(argv.url), // 网址
    //out: argv.out,                       // 输出路径
    res: argv.res ? argv.res.split(",") : ["img", "css", "js"], // 需要cache的类型
    cacheJsonPath: argv["cache-path"] || "cache-json",   // cache的路径
    pageName: argv["page-name"] || util.getPageName(),  // 当前页面名称，用来拼接json文件路径
    disableDomain: argv["disable-domain"] ? argv["disable-domain"].split(",") : []  // 对那些不支持CROS的不能使用service-worker
};


let cacheHandler = {
    getResource ($, resType) {
        let selectors = {
            "img": "img",
            "css": "link[rel=stylesheet]",
            "js": "script[src]"
        };
        if (!selectors[resType]) {
            console.error("Not support resource type: " + resType);
            return;
        }
        let $res = $(selectors[resType]);
        let resLinks = [];
        for (var i = 0; i < $res.length; i++) {
            let link = resType === "css" ? $res.eq(i).attr("href") : $res.eq(i).attr("src")
            if (config.disableDomain.indexOf(util.getHostName(link)) < 0 ) {
                resLinks.push(link);
            }
        }
        let res = {};
        res[resType] = resLinks;
        return res;
    }
};


let writeWorker = {
    writeManifest ($) {
        let cache = {
            updateTime: (new Date()).toLocaleString(),
            resources: {}
        };

        let resources = config.res;
   
        for (let i = 0; i < resources.length; i++) {
            Object.assign(cache.resources, cacheHandler.getResource($, resources[i]));
        }

        let out = fs.createWriteStream(`${config.cacheJsonPath}/${config.pageName}.sw.json`, 
                    { encoding: "utf8" }); 
        out.write(JSON.stringify(cache));
        out.end();
    }
}

console.log(`fetch ${config.url.href}`);
fetch(config.url.href)
    .then(res => {
        if (res.status !== 200) {
            console.log(`ERROR ${res.status}: ${config.url.href}`);
            return null;
        } else {
            return res.text();
        }
    })
    .then(html => {
        // 加载失败
        if (html === null) {
            return;
        }
        console.log("begin to parse and generate service worker cache list json file");
        let $ = parser.load(html);
        util.createDir(config.cacheJsonPath);
        writeWorker.writeManifest($);
        console.log("done\n"); 
    })
    .catch(function (err) {
        console.log(err);
    })

