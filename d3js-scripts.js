var height = 40;
var width = 70;
var margin = 40;

$(document).ready(function() {
  drawAll(1);
  $("#regionsddl").on("change", function(e, k) {
    var regionSelection = $("#regionsddl").val();
    drawAll(regionSelection);
  });
});

function drawAll(region) {
  drawPart('.chart1', region, 'c1');
  drawPart('.chart2', region, 'c2');
  drawPart('.chart3', region, 'c3');
  drawPart('.chart4', region, 'c4');
}

function drawPart(htmlElement, region, category) {
  $(htmlElement + " svg").remove();
  var data = [];
  var originalData = GetData(region, category);

  for (var i = 0; i < originalData.length; i++) {
    data.push({
      x: originalData[i].pos_x,
      y: originalData[i].pos_y,
      c: GetColor(originalData[i].Categorie_desc),
      size: originalData[i].size,
    });
  }
  $(htmlElement + ' span').text(originalData[0].ratio + '%');
  var labelX = 'X';
  var labelY = 'Y';

  var svg = d3.select(htmlElement)
    .append('svg')
    .attr('class', 'chart')
    .attr("width", width + margin + margin)
    .attr("height", height + margin + margin)
    .append("g")
    .attr("transform", "translate(" + margin + "," + margin + ")");

  var x = d3.scale.linear()
    .domain([d3.min(data, function(d) { return d.x; }), d3.max(data, function(d) { return d.x; })])
    .range([0, width]);

  var y = d3.scale.linear()
    .domain([d3.min(data, function(d) { return d.y; }), d3.max(data, function(d) { return d.y; })])
    .range([height, 0]);

  var scale = d3.scale.sqrt()
    .domain([d3.min(data, function(d) { return d.size; }), d3.max(data, function(d) { return d.size; })])
    .range([10, 20]);

  var opacity = d3.scale.sqrt()
    .domain([d3.min(data, function(d) { return d.size; }), d3.max(data, function(d) { return d.size; })])
    .range([1, 1]);

  var color = d3.scale.category10();

  var xAxis = d3.svg.axis().scale(x);
  var yAxis = d3.svg.axis().scale(y).orient("left");
  svg.selectAll("circle")
    .data(data)
    .enter()
    .insert("circle")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    // .attr("opacity", function(d) { return opacity(d.size); })
    .attr("r", function(d) { return scale(d.size); })
    .style("fill", function(d) { return d.c; })
    .on('mouseover', function(d, i) {
      // fade(d.c, .1);
    })
    .on('mouseout', function(d, i) {
      // fadeOut();
    })
    .transition()
    .delay(function(d, i) { return x(d.x) - y(d.y); })
    .duration(500)
    .attr("cx", function(d) { return x(d.x); })
    .attr("cy", function(d) { return y(d.y); })
}