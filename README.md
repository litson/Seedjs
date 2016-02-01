# Seedjs

一个可以将您的js/css文件添加到`localStorage`中管理的js库。（不同域的文件，需要对应服务器开启CORS）

# 特性

存储文件到`localStorage`，可帮助您实现半离线应用。

```html
    
    <style data-seed='/path/to/file/a.css'></style>
    <script data-seed='/path/to/file/a.js'></script>
    
    <script>
        // 第二次进入时，将不会触发请求。
        Seed.scan();
    </script>

```

增量更新

```html
    
        <style data-seed='/path/to/file/a.css?ver=timestamps'></style>
        <script data-seed='/path/to/file/a.js'></script>
        
        <script>
            // 时间戳更新后，本地存储的a.css也会同步被更新。
            Seed.scan();
        </script>

```

同步下载，按序执行.

不用担心代码的执行顺序，只需提供一个您想要的文件列表。

```html

    <script data-seed='jquery.js'></script>
    <script data-seed='bootstrap.js'></script>

    <script>
        
        // bootstrap.js依赖jquery。
        // Seed内部处理的时候，会并发下载bootstrap.js和jquery，
        // 但是执行他们的时候会严格按照顺序
        
        Seed.scan();
    
    </script>

```


# API

## Seed.data.map

<table width="100%">
    <tr>
        <th>名称</th>
        <th>类型</th>
        <th>必须</th>
        <th>回调</th>
    </tr>
    <tr>
        <td> callback </td>
        <td> function </td>
        <td> false </td>
        <td>  </td>
    </tr>
</table>

## Seed.scan

<table width="100%">
    <tr>
        <th>名称</th>
        <th>类型</th>
        <th>必须</th>
        <th>回调</th>
    </tr>
    <tr>
        <td> callback </td>
        <td> function </td>
        <td> false </td>
        <td> 依赖于页面上 `[data-seed]` 资源标记元素，资源加载完毕后，会触发改回调 </td>
    </tr>
</table>

