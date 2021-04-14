queue()
  .defer(d3.json, "data/geodata/StHimark.json")
  //.defer(d3.csv, "data/Covid_data/who_data_210301.csv")
  .await(ready);

function ready(error, topoCity) {
  if (error) throw error;
  const geodata = topojson.feature(data, data.objects.Nbrhood);
  generateMap(geodata);
}

function generateMap(geoData) {
  var margin = { top: 200, right: 205, bottom: 30, left: 40 };
  var width = 1200,
    height = 1200;

  var projection = d3.geoMercator().scale(150).translate([700, 500]);
  var path = d3.geoPath().projection(projection);

  var svg = d3
    .select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.left + margin.right)
    .append("g");

  svg
    .append("g")
    .attr("class", "neighborhoods")
    .selectAll("path")
    .data(geoData.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("stroke", "black");
}
