# Seedjs

## TODO


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



