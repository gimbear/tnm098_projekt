queue()
	.defer(d3.json, "data/geodata/StHimark-2.json")
  	.defer(d3.csv, "data/MC1/mc1-reports-data.csv")
	.await(ready);

function ready(error, topoCity, appData) {
	if (error) throw error;
	geodata = topojson.feature(topoCity, topoCity.objects.StHimark);
	geodata = parseData(geodata, appData);
	console.log(geodata);
	generateMap(geodata);
	slider(geoData);
}

function generateMap(geodata) {
	var width = 800;
	var height = 500;

	var svg = d3
		.select("body")
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	var projection = d3.geoMercator().scale(1).translate([0, 0]).precision(0);
	var path = d3.geoPath().projection(projection);
	var bounds = path.bounds(geodata);

	var scale =
		0.95 /
		Math.max(
			(bounds[1][0] - bounds[0][0]) / width,
			(bounds[1][1] - bounds[0][1]) / height
		);
	var transl = [
		(width - scale * (bounds[1][0] + bounds[0][0])) / 2,
		(height - scale * (bounds[1][1] + bounds[0][1])) / 2,
	];

	projection.scale(scale).translate(transl);

	svg
		.selectAll("path")
		.data(geodata.features)
		.enter()
		.append("path")
		.attr("id", function (d) {
			//console.log(d.properties.Id);
			return "nId_" + d.properties.Id;
		})
		.style("fill", "white")
		.style("stroke", "black")
		.attr("d", path)

		.on("mouseover", function (d) {
			d3.select("#nId_" + d.properties.Id)
				.attr("stroke-width", 1)
				.style("fill", "red")
				.style("opacity", 1.0);
		})

		.on("mouseout", function (d) {
			d3.select("#nId_" + d.properties.Id)
				.attr("stroke-width", 1)
				.style("fill", "white")
				.style("opacity", 1);
		});
}
