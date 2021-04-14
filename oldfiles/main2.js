/*Name,
WHO Region,
Cases - cumulative total,
Cases - cumulative total per 100000 population,
Cases - newly reported in last 7 days,
Cases - newly reported in last 24 hours,
Deaths - cumulative total,
Deaths - cumulative total per 100000 population,
Deaths - newly reported in last 7 days,
Deaths - newly reported in last 24 hours,
Transmission Classification
*/

queue()
  .defer(d3.json, 'data/map/world_geodata.json')
  .defer(d3.csv, 'data/Covid_data/who_data_210301.csv')
  .await(ready);

function ready(error, topoWorld, who_data){
  if (error) 
    throw error; 

  // Read and parse data  
  var geodataWorld = dataParseCountry(topoWorld, who_data);
  console.log(geodataWorld);

  // Create dropdwon menu
  var menu = ['Globe-map', 'World-map'];
  var dropdown = d3.select('#button')
    .append('select');

  dropdown.selectAll('options')
    .data(menu)
    .enter()
    .append('option')
    .text(function(d){return d})
    .attr('value', function(d){return d});

  // Genereate globe map first
  generateGlobeMap(geodataWorld); 

  // Call different generator functions
  dropdown.on('change', function(d){
    var selection = d3.select(this).property('value');
    console.log(selection);
    if (selection == 'World-map'){
      generateMap(geodataWorld);
    }
    else
      generateGlobeMap(geodataWorld); 
  })
};

// Generates choropleth map with Meractor-projection
// Uses geodata from Natural Earth.
function generateMap(geodata){
  // Clean and prepare SVG and tooltip element before drawing
  d3.select('svg').remove()
  d3.select('div.tooltip').remove()
  var margin = {top: 200, right: 205, bottom: 30, left: 40};
  var width = 1200, height = 1200;
  
  // Prepraring colors using colorbrewer 2.0 and labels for data classes
  var steps = [0.005, 0.01, 0.015, 0.02, 0.025, 0.03, 0.035]
  var keys = ['< 0.875%', '0.875%', '1.25%', '1.625%', '2.00%', '2.375%', '2.75%', '> 3.125%' ]
  var colors = colorbrewer.OrRd[8];
  
  // Create CFR data classes with quantile classification
  var myColor = d3.scaleQuantile()
    .domain(steps)
      .range(colors);
  
  // Tooltip functionality
  var tooltip = d3.select('body')
    .append('div')
    .style('opacity', 0)
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('background-color', 'white')
    .style('border', 'solid')
    .style('border-width', '2px')
    .style('border-radius', '5px')
    .style('padding', '5px');

  // Display and format text information within tooltip  
  var showInfo = function (d) {
    tooltip.html('<b>Country:  </b> ' + d.properties.NAME + '<p> <b>Case-fatality rate:  </b>' + (d.properties.death_rate * 100).toFixed(2) + '%')
      .style("top", (d3.event.pageY-25)+"px")  // Change x/y-position with cursor
      .style("left",(d3.event.pageX+25)+"px"); 
  }

  // Set up map-projection
  var projection = d3.geoMercator()
    .scale(150)
    .translate([700, 500]); 
  var path = d3.geoPath()
    .projection(projection);

  // initiate SVG element
  var svg = d3.select('body')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height +  margin.left + margin.right)
    .append('g')

  // Draw and fill features from geojson file. Add country_ID and color_ID to each country-feature.
  svg.append('g')
    .attr('class', 'countries')
    .selectAll('path')
    .data(geodata.features)
    .enter()
    .append('path')
    .attr('id', function(d){
      return 'country_id_'+ d.properties.NE_ID;
    })
    .attr('class', function (d) {
      var id = myColor(d.properties.death_rate);
      if (typeof (id) == 'string') {
        return 'color' + myColor(d.properties.death_rate).substring(1);
      }
    })
    .attr('d', path)
    .style('stroke-linejoin', 'round')

    .style('fill', function(d) {

      return(myColor(d.properties.death_rate));
    }).style('opacity', 0.8)
    .style('stroke', 'black')

//%%%%%%%%%%%%% MOUSE HANDELING %%%%%%%%%%%%%%%
    .on('mouseover', function(d) {
		  d3.select('#country_id_'+d.properties.NE_ID)
        .attr('stroke-width', 3)
        .attr('stroke', 'black')
        .style('opacity', 1.0)
      tooltip.style('opacity', 1)
    })
    .on('mousemove', showInfo)
    .on('mouseout', function(d) {
      d3.select('#country_id_'+d.properties.NE_ID)
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .style('opacity', 0.8);
      tooltip.style('opacity', 0)
    });
// dragging functionality insipiration from https://github.com/d3/d3-zoom
    svg.call(d3.drag().on('drag', function(){
        var temp = projection.translate();
        projection.translate([temp[0] + d3.event.dx,
          temp[1] + d3.event.dy]);
        svg.selectAll("path").attr("d", path);
    }));
  

//%%%%%%%%%%%%% CREATE LEGEND %%%%%%%%%%%%%%% 
var squareSize = 30;
var legend = svg.selectAll('.legend')
    .data([0].concat(myColor.quantiles()))
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', 'translate(60,380)');

legend.append('rect')
    .attr('y', function (d, i) { return i*squareSize})
    .attr('width', squareSize)
    .attr('height', squareSize)
    .style('stroke', 'black')
    .style('stroke-linejoin', 'round')
    .style('stroke-width', 1.8)
    .on('mouseover', function (d, i) {
      d3.select(this)
        .style('stroke', 'black')
        .style('stroke-width', 3.5)
        .style('stroke-linejoin', 'round')
      svg.selectAll('path.color' + myColor(d).substring(1))
        .attr('stroke-width', 3)
        .attr('stroke', 'black')
        .style('opacity', 1.0);
    })
    .on('mouseleave', function (d) {
      d3.select(this)
        .style('stroke', 'black')
        .style('stroke-width', 1.8)
        .style('stroke-linejoin', 'round');
      svg.selectAll('path.color' + myColor(d).substring(1))
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .style('opacity', 0.8);6
    })
    .style('fill', function(d) {
        return myColor(d)
    });

legend.append('text')
    .attr('x', function (d, i) {return 42})
    .attr('y', function (d, i) {return i*squareSize+22})
    .style('fill', 'black')
    .text(function (d, i) { return keys[i] })
    .attr('text-anchor', 'left')
    .style('alignment-baseline', 'middle');

legend.append('text')
    .text('Covid-19 case-fatality rate (%)')
    .attr('y', - 20);

}

// Generates choropleth map with orthographic-projection
// Uses geodata from Natural Earth.

function generateGlobeMap(geodata){
  // Clean and prepare SVG and tooltip element before drawing
  d3.select('svg').remove()
  d3.select('div.tooltip').remove()
  var margin = {top: 200, right: 205, bottom: 30, left: 40};
  var width = 1200, height = 100;
  
  // Prepraring colors using colorbrewer 2.0 and labels for data classes
  var steps = [0.005, 0.01, 0.015, 0.02, 0.025, 0.03, 0.035]
  var keys = ['< 0.875%', '0.875%', '1.25%', '1.625%', '2.00%', '2.375%', '2.75%', '> 3.125%' ]
  var colors = colorbrewer.OrRd[8];
  
  // Create CFR data classes with quantile classification
  var myColor = d3.scaleQuantile()
    .domain(steps)
      .range(colors);

  // Tooltip functionality
  var tooltip = d3.select('body')
    .append('div')
    .style('opacity', 0)
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('background-color', 'white')
    .style('border', 'solid')
    .style('border-width', '2px')
    .style('border-radius', '5px')
    .style('padding', '5px');

  // Display and format text information within tooltip  
  var showInfo = function (d) {
    tooltip.html('<b>Country:  </b> ' + d.properties.NAME + '<p> <b>Case-fatality rate:  </b>' + (d.properties.death_rate * 100).toFixed(2) + '%')
      .style("top", (d3.event.pageY-25)+"px") 
      .style("left",(d3.event.pageX+25)+"px"); 
  }

  // Set up map-projection
  var posX = (width / 2);
  var posY = (height / 2)+300;
  var scale = 300;
  var projection = d3.geoOrthographic()
    .scale(scale)
    .translate([posX, posY]); 
  var path = d3.geoPath()
    .projection(projection);
    
  // initiate SVG element
  var svg = d3.select('body')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', width + margin.left + margin.right)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .attr('transform', 'translate(120,0)')
    
  // draw background for sphere illusion
  var background_circle = svg.append('circle')
    .attr('cx', posX)
    .attr('cy', posY)
    .attr('r', projection.scale())
    .style('fill', '#80b0ff')
    .style('opacity', 0.8);

  // draw and fill features from geojson file. Add country_ID and color_ID to each country-feature.
  svg.append('g')
    .attr('class', 'continent')
    .selectAll('path')
    .data(geodata.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('id', function(d){
      return 'country_id_'+ d.properties.NE_ID;
    })
    .attr('class', function (d) {
      var id = myColor(d.properties.death_rate);
      if (typeof (id) == 'string') {
        return 'color' + myColor(d.properties.death_rate).substring(1);
      }
    })
    .style('fill', function(d) {
      return(myColor(d.properties.death_rate));
    }).style('opacity', 0.8)
    .style('stroke', 'black')

//%%%%%%%%%%%%% MOUSE HANDELING %%%%%%%%%%%%%%%
    .on('mouseover', function(d) {
      d3.select('#country_id_'+d.properties.NE_ID)
        .attr('stroke-width', 3)
        .attr('stroke', 'black')
        .style('opacity', 1.0)
      tooltip.style('opacity', 1)
    })
    .on('mousemove', showInfo)
    .on('mouseout', function(d) {
      d3.select('#country_id_'+d.properties.NE_ID)
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .style('opacity', 0.8);
      tooltip.style('opacity', 0)
    });

    // rotation functionality insipiration from https://github.com/d3/d3-zoom
    svg.call(d3.drag().on('drag', function(d){
      var c = projection.rotate();
      projection.rotate([c[0]+d3.event.dx/2, c[1]-d3.event.dy/2, c[2]])
      path = d3.geoPath().projection(projection)
      svg.selectAll('path').attr('d', path)
    }))

//%%%%%%%%%%%%% CREATE LEGEND %%%%%%%%%%%%%%% 
var squareSize = 30;
var legend = svg.selectAll('.legend')
    .data([0].concat(myColor.quantiles()))
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', 'translate(0,330)'); 

legend.append('rect')
    .attr('y', function (d, i) { return i*squareSize})
    .attr('width', squareSize)
    .attr('height', squareSize)
    .style('stroke', 'black')
    .style('stroke-linejoin', 'round')
    .style('stroke-width', 1.8)
    .on('mouseover', function (d, i) {
      d3.select(this)
        .style('stroke', 'black')
        .style('stroke-width', 3.5)
        .style('stroke-linejoin', 'round')
      svg.selectAll('path.color' + myColor(d).substring(1))
        .attr('stroke-width', 3)
        .attr('stroke', 'black')
        .style('opacity', 1.0);
    })
    .on('mouseleave', function (d) {
      d3.select(this)
        .style('stroke', 'black')
        .style('stroke-width', 1.8)
        .style('stroke-linejoin', 'round');
      svg.selectAll('path.color' + myColor(d).substring(1))
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .style('opacity', 0.8);6
    })
    .style('fill', function(d) {
        return myColor(d)
    });

legend.append('text')
    .attr('x', function (d, i) {return 42})
    .attr('y', function (d, i) {return i*squareSize+22})
    .style('fill', 'black')
    .text(function (d, i) { return keys[i] })
    .attr('text-anchor', 'left')
    .style('alignment-baseline', 'middle');

legend.append('text')
    .text('Case-fatality rate (%)')
    .attr('y', - 20);
}

// parse through WHO data set and calculate CFR then merge it with the geojson data.
function dataParseCountry(data, who_data){
  const geodata = topojson.feature(data, data.objects.countries);
  // Pick data from each country WHO-data set and store calculated deathrate in a Object. 
  var rateByCountry = {};
  who_data.forEach(d=>{
    rateByCountry[d.Name]= +d['Deaths - cumulative total per 100000 population']/+d['Cases - cumulative total per 100000 population'];
  });
  // Gather data from different different countries in different
  // regions in the WHO-data set and summerize them in a nested Object.
  var nest = d3.nest()
    .key(function(d){return d['WHO Region']})
    .rollup(function(k) { return  {
      deaths: d3.sum(k, function(d) {return d['Deaths - cumulative total per 100000 population']; }),
      cases: d3.sum(k, function(d) {return d['Cases - cumulative total per 100000 populationn']; })
      };})
    .entries(who_data);
  console.log(nest);
  // Calculate deathrate from summurized data and store them in a Object.
  var rateByContinent = {};
  nest.forEach(d=> {
    rateByContinent[d.key] = d.value.deaths/d.value.cases;
  })
  // Merge geodata with WHO-data.
  geodata.features.forEach(function(d) {
    d.count = +d.count;
    Object.assign(d.properties, {'death_rate': Math.round((rateByCountry[d.properties.NAME] + Number.EPSILON) * 10000) / 10000, 'highlighted': false, 'number': d.count})
  });

  return geodata;
}
