# Seedjs2

Seedjs 2.0

修复bug，调整接口。


```js

Seed.use( [ 'http://domian.com/path/to/a.js', 'http://domain.com/path/to/b.js' ] );

Seed.use( 'http://domain.com/path/to/script.js' );

Seed.use( 'http://domian.com/path/to/style.css' );

Seed.use( 'http://domain.com/path/to/image.jpg' );

Seed.use( {
  path: 'http://domain.com/path/to/somefile',
  type: 'json'
} );

Seed.use( {
  path: 'http://domian.com/path/to/somefile',
  type: 'image/png'
} );





```

```html
 
<script data-seed="http://domain.com/path/to/script.js"></script>

<style data-seed="http://domain.com/path/to/style.css"></style>

<img src="http://domain.com/path/to/placeholder.jpg" data-seed="http://domain.com/path/to/image.jpg">

<script>
    Seed.scan();
</script>

```
