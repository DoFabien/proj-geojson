# proj-geojson
Reproject a geojson with proj4js

## NPM
```sh
    npm install proj-geojson
```

## Example
```js
    const projgeojson = require('proj-geojson');
    const fs = require('fs');

    let geojson = JSON.parse(fs.readFileSync('my-file.geojson'));
    const geojson2154 = projgeojson(geojson, 'EPSG:4326', 'EPSG:2154');
    console.log(geojson2154);
```