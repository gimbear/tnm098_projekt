
function parseData(geoData, appData){
    
    var parseDate = d3.timeParse('%Y-%m-%d %H:%M:%S');

    //For scaling the axis of the slider
    //var maxDate = d3.max(appData, function (d) { return parseDate(d['time']) });
    //var minDate = d3.min(appData, function (d) { return parseDate(d['time']) });

    //var maxMag = d3.max(appData, function (d) { return d['shake_intensity'] });
    //var minMag = d3.min(appData, function (d) { return d['shake_intensity'] })

    //Set the axis for the scaler
    xScale.domain([minDate, maxDate]);
    navXScale.domain(xScale);

    var shakeIntensityNbrhood = {};
    appData.forEach(d=>{
        shakeIntensityNbrhood[d.location] = +d['shake_intensity'];
    });

    var timeShakeIntensity = {};
    appData.forEach(d=> {
        timeShakeIntensity[d.location] = +parseDate(d['time']);
    });

    geoData.features.forEach(function(d) {
        Object.assign(d.properties, {'intensity': Math.round(shakeIntensityNbrhood[d.properties.Nbrhood]), 'timestamp': timeShakeIntensity[d.properties.Nbrhood]})
    });
    return geoData;
}