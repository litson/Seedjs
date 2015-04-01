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


