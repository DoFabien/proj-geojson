/*
Input :  Geojson, codeFrom: string, codeTo:string, digits : integer
*/
const proj4 = require('proj4');
const PROJS = require('./projs.json');

const getProjByCode = function(code){
    for (let i = 0; i < PROJS.length; i++){
        if(PROJS[i]['code'] == code){
            return PROJS[i];
        }
    }
    console.log(code + ' doesn\'t exist in projs.json');
    return undefined;
}

const projectPoint = function(point, fromProj4, toProj4, digits = null){
    let res = proj4(fromProj4,toProj4,point)
    if (digits){
        res[0] =  parseFloat(res[0].toFixed(digits));
        res[1] =  parseFloat(res[1].toFixed(digits));
    }
    return res;
}

const projectRing = function(points, fromProj4, toProj4, digits = null){ // Linestring, MultiPoint?
    for (let i = 0; i < points.length; i++){
        points[i] = projectPoint(points[i], fromProj4,toProj4, digits)
    }
    return points;
}

const projectRings = function(rings, fromProj4, toProj4, digits = null){ //MultiLinestring, Polygon
    for (let i = 0; i < rings.length; i++){
        rings[i] = projectRing(rings[i], fromProj4,toProj4, digits)
    }
    return rings;
}

const projectMultiRings = function(multiRings, fromProj4, toProj4, digits = null){ // MultiPolygon
    for (let i = 0; i < multiRings.length; i++){
        multiRings[i] = projectRings(multiRings[i], fromProj4,toProj4, digits)
    }
    return multiRings;
}

const projectFeature = function(feature, fromProj4, toProj4, digits = null){
    if( feature.geometry.type === 'Point'){
        feature.geometry.coordinates = projectPoint(feature.geometry.coordinates ,fromProj4, toProj4, digits )
    } else if ( feature.geometry.type === 'MultiPoint' || feature.geometry.type === 'LineString'){
        feature.geometry.coordinates = projectRing(feature.geometry.coordinates ,fromProj4, toProj4, digits )
    } else if ( feature.geometry.type === 'MultiLineString' || feature.geometry.type === 'Polygon'){
        feature.geometry.coordinates = projectRings(feature.geometry.coordinates ,fromProj4, toProj4, digits )
    } else if ( feature.geometry.type === 'MultiPolygon'){
        feature.geometry.coordinates = projectMultiRings(feature.geometry.coordinates ,fromProj4, toProj4, digits )
    } else {
        console.log( 'oups')
    }
    return feature;
}

const projectFeatureCollection = function(_featureCollection, codeSridFrom, codeSridTo, digits = null){
    const fromProjection = getProjByCode(codeSridFrom)['proj4'];
    const toProjection = getProjByCode(codeSridTo)['proj4'];
    if (!fromProjection || !fromProjection){
        return;
    }

    let featureCollection = JSON.parse(JSON.stringify(_featureCollection));
    let features = featureCollection.features;
    for (let i = 0; i < features.length; i++){
        features[i] = projectFeature(features[i],fromProjection,toProjection, digits);
    }
    return featureCollection;
}

module.exports = projectFeatureCollection;
