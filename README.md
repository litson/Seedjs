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

  注意：文件路径本身为绝对路径的话，不受base限制


### data.jsonp

- 类型： `String`
- 默认值： `null`
- 用法：

    ```js
        Seeed.data.jsonp = '_seedJsonp_';
    ```

    `Seedjs` 拉取文件的方式为 xhr 拉取，但是需要对应的静态服务器开启cors。

    也提供了 jsonp 的方式，将我们的文件文本返回前端执行。
