
function parseData(geoData, appData){
    
    var shakeIntensityNbrhood = {};
    appData.forEach(d=>{
        shakeIntensityNbrhood[d.location] = d['shake_intensity'];
    });

    geoData.features.forEach(function(d) {
        Object.assign(d.properties, {'intensity': Math.round(shakeIntensityNbrhood[d.properties.location])})
    }
    return geoData;
}