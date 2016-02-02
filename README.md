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



        