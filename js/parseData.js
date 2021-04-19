
function parseData(geoData, appData){
    
    var parseDate = d3.timeParse('%Y-%m-%d %H:%M:%S');

    //For scaling the axis of the slider
    //var maxDate = d3.max(appData, function (d) { return parseDate(d['time']) });
    //var minDate = d3.min(appData, function (d) { return parseDate(d['time']) });

    //var maxMag = d3.max(appData, function (d) { return d['shake_intensity'] });
    //var minMag = d3.min(appData, function (d) { return d['shake_intensity'] })

    //Set the axis for the scaler
    //xScale.domain([minDate, maxDate]);
    //navXScale.domain(xScale);

    var shakeTimeIntensity = {};
    var temp = {};
    var tempShakeTimeIntensity = {};

    appData.forEach(d=>{
        shakeTimeIntensity[d.location] = [];
    });

    

    appData.forEach(d=>{
        shakeTimeIntensity[d.location].push([parseDate(d['time']), d['shake_intensity']]);//(tempShakeTimeIntensity[d]);//+[d, (tempShakeTimeIntensity[d.location])];
    });

    geoData.features.forEach(function(d) {
        Object.assign(d.properties, {'intensityAndTime': shakeTimeIntensity[d.properties.Id]});
    });
    return geoData;

    /*var nest = d3.nest()
        .key(function(d){return d['location']})
        .rollup(function(d) { return  {
            time: d['time'],
            shake_intensity: d['shake_intensity']}
        })
        .entries(appData);
    console.log(nest);*/

    /*appData.forEach(d=>{
        shakeTimeIntensity[d.location] = (tempShakeTimeIntensity[d.location]);
    });*/
    
}