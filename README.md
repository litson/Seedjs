# Seedjs

## TODO
- JSONP support.
- Combine in native.
- CSS don't need to execute sequentially.
- File position deal, top or bottom or somewhere.

## Features

- `Seed.config`

```js

  Seed.config({
        base: 'http://yourdomain.org',                        // Your domain
        // Tag some alias for your resources, you can setting an absoultly path into it.
        alias: {                                              
            zepto: 'http://cdn.somedomain.org/zepto.js',
            angularjs: '/static/js/angularjs.js',
            bootstrap: '/static/css/bootstrap.css'
        },
        // Open or close debug mode.
        debug: true,
        // Default : '__seed_version_' , if you changed it, the resouces in localStorge will be updated.
        ver: 'timestamps'
    });


```

- `Seed.use`

```js

  // When all the file that your required be loaded, then the 'callBack' function can be used.
   function callBack(){
      console.log(Zepto);
   }

  Seed.use(
      [
        'zepto'
        , 'angularjs'
        , 'bootstrap'
        /* You can also setting some extra file. */
        , 'path/to/some/file.js' 
      ]
      , callBack
  );

```

- `Seed.openRealtimeDebugMode`

```js

  // Don't use localStorge.
  Seed.openRealtimeDebugMode();


```

- `Seed.scan`

```html

 <!-- =================== If Seedjs has been loaded in this page =================== -->

 <style data-seed="path/to/file.css"></style>
 <script>
    Seed.scan(); // Then 'path/to/file.css' can be preferred loaded.
 </script>

 <script data-seed="/path/to/file.js"></script>
 <script>
    Seed.scan(); // Then 'path/to/file.js' can be preferred loaded.
 </script>
 


```

## TEST

Network: GPRS (50Kbps 500ms RTT)

Number of resouce: 2

Resouces size: about 20kb.

<table>
  <tr>
    <th> Cache </th>
    <th> localStorage </th>
    <th> Time </th>
  </tr>
  <tr>
    <td> no </td>
    <td> no </td>
    <td> 0 </td>
  </tr>
  <tr>
    <td> yes </td>
    <td> no </td>
    <td> 0 </td>
  </tr>
  <tr>
    <td> no </td>
    <td> yes </td>
    <td> 0 </td>
  </tr>
  <tr>
    <td> yes </td>
    <td> yes </td>
    <td> 0 </td>
  </tr>
</table>




