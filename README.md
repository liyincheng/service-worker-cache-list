# service worker cache list

一个用来生成manifest文件的工具，根据url抓取的html里的img/css/js资源放到manifest文件的cache里面

(A tool to generate manifest file from a given url. It will crawl the img/css/js resources link from the html and write to manifest CACHE section.)


使用方法：

(Usage:)

```shell
npm install -g service-worker-cache-list
sw-cache --url=https://github.com
```

--url 后面带上想要cached的网页地址

(--url with the url to process)


然后就会生成：

(It will then generate:)


* cache列表的json文件 cache-json/home.sw.json 


生成的json文件结构：

(The cache file structure:)


```json
{
    "updateTime": "10/2/2017, 3:17:59 PM",
    "resources": {
        "img": [
            "https://assets-cdn.github.com/images/modules/site/universe-octoshop.png"
        ],
        "css": [
            "https://assets-cdn.github.com/assets/frameworks-bedfc518345498ab3204d330c1727cde7e733526a09cd7df6867f6a231565091.css"
        ],
        "js": [
            "https://assets-cdn.github.com/assets/compat-91f98c37fc84eac24836eec2567e9912742094369a04c4eba6e3cd1fa18902d9.js"
        ]
    }
}
``` 

可以支持定制参数：

(More arguments to customize:)

```
usage2: sw-cache --url=https://github.com #the url to fetch
                 --res=img,css,js  # the resource type to cache in service worker json file
                 --cache-pah=cache-json  # the folder to put the json file
                 --page-name=home        # the manifest/html file name
                 --disable-domain=test1.com,test2.com    # not cache domain which not support CROS
```

res指定需要cache的资源，默认是三种img,css,js，--acache-path指定生成的json文件的存放目录，--page-name指定文件名称，--page-name，默认首页是使用home，其它页面使用路径/最后一个内容。 --disable-domain表示不进行缓存的域名，有些域名的资源不支持CORS，不能service worker缓存



