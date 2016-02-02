# Seedjs

可以将您的 `js` 、 `css` 文件在 `localStorage` 中管理。

## 全局配置

### data.delimiter

- 类型： `String`
- 默认值： `"seed"`
- 用法：

    ```js
        Seed.data.delimiter = 'src';
    ```

    修改 dom 查找的界定符。

### data.debug

- 类型： `Boolean`
- 默认值： `false`
- 用法：

    ```js
        Seed.data.debug = true;
    ```

    实时获取文件，并且文件不会存储到 `localStorage`中。


### data.base

- 类型： `String`
- 默认值： `window.location.origin`
- 用法：

   ```js
     Seed.data.base = 'http://localhost:63342/GITHUB/Seedjs'
   ```
  
  文件路径查找的前缀。

  注意：文件路径本身为绝对路径的话，不受 `base` 限制


### data.jsonp

- 类型： `String`
- 默认值： `null`
- 用法：

    ```js
        Seed.data.jsonp = '_seedJsonp_';
    ```

    `Seedjs` 拉取文件的方式为 xhr 拉取，但是需要对应的静态服务器开启cors。

    也提供了 jsonp 的方式，将我们的文件文本返回前端执行。

### data.map

- 类型： `String`
- 默认值： `null`
- 用法：

    ```js
        // defaultConfig 为 Seedjs 为您分析好的返回值，可供参考，或再无需分析的时候可直接返回他
        Seed.data.map = function ( url, defaultConfig ){
                      // 根据 url 分析出如下数据结构
                      
                      return {
                            id     : '将会被存储的id',
                            hook   : '是否应该更新的标记',
                            fileUrl: '原始路径'
                      }
                      
                      // 如果拿不定主意，或者有些许资源无需分析，可以返回 defaultConfig 
                     return  defaultConfig;
                 }
    ```