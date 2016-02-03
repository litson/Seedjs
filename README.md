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

    `Seedjs` 拉取文件的方式为 `xhr` 拉取，但是需要对应的静态服务器开启 `CORS`。

    也提供了 `jsonp` 的方式，将我们的文件文本返回前端执行。

### data.map

- 类型： `String`
- 默认值： `null`
- 用法：

    ```js
        // defaultConfig 为 Seedjs 为您分析好的返回值，可供参考，或再无需分析的时候可直接返回他
        Seed.data.map = function ( url, defaultConfig ) {
            // 根据 url 分析出如下数据结构
        
            return {
                id     : '将会被存储的id',
                hook   : '是否应该更新的标记',
                fileUrl: '原始路径'
            }
        
            // 如果拿不定主意，或者有些许资源无需分析，可以返回 defaultConfig
            return defaultConfig;
        }
    ```
    
    该配置可对文件路径进行映射修改，可用于路径转换、在线调试等。
    
## API

### Seed.setItem( key, dataString )

- 参数：
    - `{String} key`
    - `{String} dataString`
- 用法：
    
    对 `localStorage.setItem` 的封装。
    
    内部做了是否支持 `localStorage` 的检测。
    
    ```js
        
        Seed.setItem( 'documents', '一些数据' );
    
    ```
    
### Seed.getItem( key )

- 参数：
    - `{String} key`
- 返回值：`key` 对应的 `localStorage` 数据。
- 用法：
    
    根据 `key` 来获取本地存储的数据。
    
    内部做了是否支持 `localStorage` 的检测。
    
    ```js
        
        Seed.getItem( 'documents' );
    
    ```
    
### Seed.removeItem( key )

- 参数：
    - `{String} key`
- 用法：
    
    对 `localStorage.setItem` 的封装，无参调用，会清除所有的 `localStorage`。
    
    内部做了是否支持 `localStorage` 的检测。
    
    ```js
        
        Seed.getItem( 'documents' );
    
    ```