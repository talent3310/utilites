
function intToString(value) {
  var suffixes = ["", "K", "M", "B", "T"];
  var suffixNum = Math.floor(("" + value).length / 3);
  var shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(2));
  if (shortValue % 1 != 0) {
    var shortNum = shortValue.toFixed(1);
  }
  return shortValue + suffixes[suffixNum];
}

function GetColor(element) {
  var arr = ["#2078ff", "#f83098", "#7030a0", "#00fa00"];
  if (element == "m_r_bar_first_milk" || element == "m_l_bar_first_milk") return arr[0];
  if (element == "m_r_bar_tailored_nutrition" || element == "m_l_bar_tailored_nutrition") return arr[1];
  if (element == "m_r_bar_first_diet" || element == "m_l_bar_first_diet") return arr[2];
  if (element == "m_r_bar_organic" || element == "m_l_bar_organic") return arr[3];
}

var stageArr = ["select", "define", "develop", "implement", "launch", "post-launch"];
var getYvalue = function(element) {
  return stageArr.indexOf(element) * 41;
}

var labels_sum_values = function(element, type) {
  if (type == 'right') {
    return element.m_r_bar_first_milk + element.m_r_bar_tailored_nutrition + element.m_r_bar_first_diet + element.m_r_bar_organic;
  } else {
    return element.m_l_bar_first_milk + element.m_l_bar_tailored_nutrition + element.m_l_bar_first_diet + element.m_l_bar_organic;
  }
}


var initStackedBarChart = {
  draw: function(config) {
    me = this,
      domEle_left = config.element_left,
      domEle_right = config.element_right,
      stackKey_left = config.key_left,
      stackKey_right = config.key_right,
      data = config.data,
      margin = { top: 18, right: 0, bottom: 0, left: 0 },

      width = 360,
      height = 228,
      xScale = d3.scaleLinear().rangeRound([0, width]),
      yScale = d3.scaleBand().rangeRound([height, 0]).padding(0.1),
      color = d3.scaleOrdinal(d3.schemeCategory20),
      xAxis = d3.axisBottom(xScale),
      yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%b"));

    var stack_left = d3.stack()
      .keys(stackKey_left)
      .offset(d3.stackOffsetNone);

    var stack_right = d3.stack()
      .keys(stackKey_right)
      .offset(d3.stackOffsetNone);

    var layers_left = stack_left(data);
    var layers_right = stack_right(data);

    yScale.domain(data.map(function(d) { return getYvalue(d.stage) }));
    xScale.domain([0, d3.max(layers_left[layers_left.length - 1], function(d) { return d[0] + d[1]; })]).nice();

    // left ==========================================================
    var original_svg_left = d3.select("#" + domEle_left).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    var ss = width - margin.left
    var svg_left = original_svg_left.append("g")
      .attr("transform", "translate(" + ss + "," + margin.top + ")");

    original_svg_left.append("g")
      .attr("id", "labels");

    var layer_left = svg_left.selectAll(".layer_left")
      .data(layers_left)
      .enter().append("g")
      .attr("class", "layer_left")
      .style("fill", function(d, i) { return GetColor(d.key); });

    layer_left.selectAll("rect")
      .data(function(d) { return d; })
      .enter().append("rect")
      .attr("y", function(d) { return getYvalue(d.data.stage); })
      .attr("x", function(d) { return -xScale(d[1]); })
      .attr("height", 16)
      .attr("width", function(d) { return xScale(d[1]) - xScale(d[0]) });

    labels = d3.select("#stacked-bar-left #labels");
    textNodes = labels.selectAll("foreignObject").data(data);
    foreignObjects = textNodes.enter().append("foreignObject")
      .attr("x", function(d, i) { return width - 126 - xScale(labels_sum_values(d)); })
      .attr("y", function(d, i) { return getYvalue(d.stage) + 16; })
      .attr("width", function(d, i) { return 120 })
      .attr("height", function(d, i) { return 40 })

    htmlDOMs = foreignObjects.append("xhtml:body")
      .style("margin", 0)
      .style("padding", 0)
      .style("text-align", "right")

    htmlLabels = htmlDOMs.append("div")
      .attr("class", "htmlLabel")
      .html(function(d, i) {

        var ratio_bar_left_number = d.ratio_bar_left.substring(0, d.ratio_bar_left.length - 1);
        if (ratio_bar_left_number > 0)
          return ratio_bar_left_number + '%' + '&nbsp;&nbsp;<i class="fa fa-arrow-circle-up" aria-hidden="true" style="color: green"></i>&nbsp;' + intToString(d.nb_projects_bar_left);
        if (ratio_bar_left_number < 0)
          return ratio_bar_left_number + '%' + '&nbsp;&nbsp;<i class="fa fa-arrow-circle-down" aria-hidden="true" style="color: #f83098"></i>&nbsp;' + intToString(d.nb_projects_bar_left);
      });

    // axis
    // svg_left.append("g")
    //   .attr("class", "axis axis--x")
    //   .attr("transform", "translate(0," + (height + 5) + ")")
    //   .call(xAxis);

    // svg_left.append("g")
    //   .attr("class", "axis axis--y")
    //   .attr("transform", "translate(0,0)")
    //   .call(yAxis);

    // right ==============================================
    xScale.domain([0, d3.max(layers_right[layers_right.length - 1], function(d) { return d[0] + d[1]; })]).nice();

    var original_svg_right = d3.select("#" + domEle_right).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    var svg_right = original_svg_right.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    original_svg_right.append("g")
      .attr("id", "labels");

    var layer_right = svg_right.selectAll(".layer_right")
      .data(layers_right)
      .enter().append("g")
      .attr("class", "layer_right")
      .style("fill", function(d, i) { return GetColor(d.key); });

    layer_right.selectAll("rect")
      .data(function(d) { return d; })
      .enter().append("rect")
      .attr("y", function(d) { return getYvalue(d.data.stage); })
      .attr("x", function(d) { return xScale(d[0]); })
      .attr("height", 16)
      .attr("width", function(d) { return xScale(d[1]) - xScale(d[0]) });
    // labels
    labels = d3.select("#stacked-bar-right #labels");
    textNodes = labels.selectAll("foreignObject").data(data);
    foreignObjects = textNodes.enter().append("foreignObject")
      .attr("x", function(d, i) { return xScale(labels_sum_values(d, "right")) + 6; })
      .attr("y", function(d, i) { return getYvalue(d.stage) + 16; })
      .attr("width", function(d, i) { return 120 })
      .attr("height", function(d, i) { return 40 })

    htmlDOMs = foreignObjects.append("xhtml:body")
      .style("margin", 0)
      .style("padding", 0)

    htmlLabels = htmlDOMs.append("div")
      .attr("class", "htmlLabel")
      .html(function(d, i) {

        var m_ratio_value_number = d.m_ratio_bar_right.substring(0, d.m_ratio_bar_right.length - 1);
        if (m_ratio_value_number > 0)
          return intToString(d.m_value_bar_right) + '&nbsp;&nbsp;<i class="fa fa-arrow-circle-up" aria-hidden="true" style="color: green"></i>&nbsp;' + m_ratio_value_number + '%';
        if (m_ratio_value_number < 0)
          return intToString(d.m_value_bar_right) + '&nbsp;&nbsp;<i class="fa fa-arrow-circle-down" aria-hidden="true" style="color: #f83098"></i>&nbsp;' + m_ratio_value_number + '%';
      });
    // axis
    // svg_right.append("g")
    //   .attr("class", "axis axis--x")
    //   .attr("transform", "translate(0," + (height + 5) + ")")
    //   .call(xAxis);

    // svg_right.append("g")
    //   .attr("class", "axis axis--y")
    //   .attr("transform", "translate(0,0)")
    //   .call(yAxis);
  }
}

var data = [{
    "segment": "stage",
    "product_category": "Product_Category1",
    "project_type": "Project_type1",
    "project_leader": "Project_leader1",
    "danlc": "DanLC1",
    "life_cycle_stage": "Life_cycle_stage1",
    "progress_status": "Progress_status1",
    "metric": "Total-Net-Sales",
    "triangle_description": "Total Net Sales by Stages",
    "region": "all regions",
    "stage": "select",
    "year": 2017,
    "m_projects_without_bc": 30,
    "m_projects_without_bc_ratio": "0%",
    "ratio_bar_left": "2.4%",
    "nb_projects_bar_left": 256,
    "m_l_bar_organic": 16,
    "m_l_bar_first_diet": 40,
    "m_l_bar_tailored_nutrition": 120,
    "m_l_bar_first_milk": 80,
    "m_tri_l_ratio": "66.5%",
    "m_tri_r_ratio": "35.0%",
    "m_r_bar_first_milk": 5000000,
    "m_r_bar_tailored_nutrition": 5000000,
    "m_r_bar_first_diet": 2000000,
    "m_r_bar_organic": 300000,
    "m_value_bar_right": 12300000,
    "m_ratio_bar_right": "2.4%"
  },
  {
    "segment": "stage",
    "product_category": "Product_Category1",
    "project_type": "Project_type1",
    "project_leader": "Project_leader1",
    "danlc": "DanLC1",
    "life_cycle_stage": "Life_cycle_stage1",
    "progress_status": "Progress_status1",
    "metric": "Total-Net-Sales",
    "triangle_description": "Total Net Sales by Stages",
    "region": "all regions",
    "stage": "define",
    "year": 2017,
    "m_projects_without_bc": 10,
    "m_projects_without_bc_ratio": "0%",
    "ratio_bar_left": "-2.4%",
    "nb_projects_bar_left": 22,
    "m_l_bar_organic": 0,
    "m_l_bar_first_diet": 4,
    "m_l_bar_tailored_nutrition": 9,
    "m_l_bar_first_milk": 9,
    "m_tri_l_ratio": "5.7%",
    "m_tri_r_ratio": "5.0%",
    "m_r_bar_first_milk": 400000,
    "m_r_bar_tailored_nutrition": 500000,
    "m_r_bar_first_diet": 300000,
    "m_r_bar_organic": 0,
    "m_value_bar_right": 1200000,
    "m_ratio_bar_right": "-2.4%"
  },
  {
    "segment": "stage",
    "product_category": "Product_Category1",
    "project_type": "Project_type1",
    "project_leader": "Project_leader1",
    "danlc": "DanLC1",
    "life_cycle_stage": "Life_cycle_stage1",
    "progress_status": "Progress_status1",
    "metric": "Total-Net-Sales",
    "triangle_description": "Total Net Sales by Stages",
    "region": "all regions",
    "stage": "develop",
    "year": 2017,
    "m_projects_without_bc": 5,
    "m_projects_without_bc_ratio": "0%",
    "ratio_bar_left": "-2.4%",
    "nb_projects_bar_left": 24,
    "m_l_bar_organic": 1,
    "m_l_bar_first_diet": 3,
    "m_l_bar_tailored_nutrition": 3,
    "m_l_bar_first_milk": 17,
    "m_tri_l_ratio": "6.7%",
    "m_tri_r_ratio": "20.0%",
    "m_r_bar_first_milk": 2000000,
    "m_r_bar_tailored_nutrition": 1500000,
    "m_r_bar_first_diet": 500000,
    "m_r_bar_organic": 100000,
    "m_value_bar_right": 4100000,
    "m_ratio_bar_right": "+2.4%"
  },
  {
    "segment": "stage",
    "product_category": "Product_Category1",
    "project_type": "Project_type1",
    "project_leader": "Project_leader1",
    "danlc": "DanLC1",
    "life_cycle_stage": "Life_cycle_stage1",
    "progress_status": "Progress_status1",
    "metric": "Total-Net-Sales",
    "triangle_description": "Total Net Sales by Stages",
    "region": "all regions",
    "stage": "implement",
    "year": 2017,
    "m_projects_without_bc": 5,
    "m_projects_without_bc_ratio": "0%",
    "ratio_bar_left": "2.4%",
    "nb_projects_bar_left": 59,
    "m_l_bar_organic": 0,
    "m_l_bar_first_diet": 9,
    "m_l_bar_tailored_nutrition": 25,
    "m_l_bar_first_milk": 25,
    "m_tri_l_ratio": "16.5%",
    "m_tri_r_ratio": "35.0%",
    "m_r_bar_first_milk": 600000,
    "m_r_bar_tailored_nutrition": 400000,
    "m_r_bar_first_diet": 210000,
    "m_r_bar_organic": 0,
    "m_value_bar_right": 1210000,
    "m_ratio_bar_right": "-2.4%"
  },
  {
    "segment": "stage",
    "product_category": "Product_Category1",
    "project_type": "Project_type1",
    "project_leader": "Project_leader1",
    "danlc": "DanLC1",
    "life_cycle_stage": "Life_cycle_stage1",
    "progress_status": "Progress_status1",
    "metric": "Total-Net-Sales",
    "triangle_description": "Total Net Sales by Stages",
    "region": "all regions",
    "stage": "launch",
    "year": 2017,
    "m_projects_without_bc": 0,
    "m_projects_without_bc_ratio": 0,
    "ratio_bar_left": "-2.4%",
    "nb_projects_bar_left": 24,
    "m_l_bar_organic": 0,
    "m_l_bar_first_diet": 4,
    "m_l_bar_tailored_nutrition": 12,
    "m_l_bar_first_milk": 8,
    "m_tri_l_ratio": "6.7%",
    "m_tri_r_ratio": "5.0%",
    "m_r_bar_first_milk": 6000000,
    "m_r_bar_tailored_nutrition": 4000000,
    "m_r_bar_first_diet": 2100000,
    "m_r_bar_organic": 0,
    "m_value_bar_right": 12100000,
    "m_ratio_bar_right": "+2.4%"
  },
  {
    "segment": "stage",
    "product_category": "Product_Category1",
    "project_type": "Project_type1",
    "project_leader": "Project_leader1",
    "danlc": "DanLC1",
    "life_cycle_stage": "Life_cycle_stage1",
    "progress_status": "Progress_status1",
    "metric": "Total-Net-Sales",
    "triangle_description": "Total Net Sales by Stages",
    "region": "all regions",
    "stage": "post-launch",
    "year": 2017,
    "m_projects_without_bc": 50,
    "m_projects_without_bc_ratio": "13.9% 2.4%",
    "ratio_bar_left": "3.4%",
    "nb_projects_bar_left": 0,
    "m_l_bar_organic": 24,
    "m_l_bar_first_diet": 45,
    "m_l_bar_tailored_nutrition": 45,
    "m_l_bar_first_milk": 10,
    "m_tri_l_ratio": "0%",
    "m_tri_r_ratio": "63%",
    "m_r_bar_first_milk": 1300000,
    "m_r_bar_tailored_nutrition": 300000,
    "m_r_bar_first_diet": 0,
    "m_r_bar_organic": 3300000,
    "m_value_bar_right": 33232,
    "m_ratio_bar_right": "+2.4%"
  }
];

var key_left = ["m_l_bar_first_milk", "m_l_bar_tailored_nutrition", "m_l_bar_first_diet", "m_l_bar_organic"];
var key_right = ["m_r_bar_first_milk", "m_r_bar_tailored_nutrition", "m_r_bar_first_diet", "m_r_bar_organic"];
initStackedBarChart.draw({
  data: data,
  key_left: key_left,
  key_right: key_right,
  element_left: 'stacked-bar-left',
  element_right: 'stacked-bar-right'
});

// draw tri
$(document).ready(function() {
  setValues('all regions');
  $("#regionsddl").on("change", function(e, k) {
    var regionSelection = $("#regionsddl").val();
    setValues(regionSelection);
  });
});

function GetData(region, stage) {
  return data.filter(function(el) {
    return el.region == region &&
    el.stage == stage
  })
}

function setValues(region) {
  $(".tripzoid-table tr:nth-child(1) td:nth-child(1)").text(GetData(region, 'select')[0].m_tri_l_ratio);
  $(".tripzoid-table tr:nth-child(1) td:nth-child(3)").text(GetData(region, 'select')[0].m_tri_r_ratio);
  $(".tripzoid-table tr:nth-child(2) td:nth-child(1)").text(GetData(region, 'define')[0].m_tri_l_ratio);
  $(".tripzoid-table tr:nth-child(2) td:nth-child(3)").text(GetData(region, 'define')[0].m_tri_r_ratio);
  $(".tripzoid-table tr:nth-child(3) td:nth-child(1)").text(GetData(region, 'develop')[0].m_tri_l_ratio);
  $(".tripzoid-table tr:nth-child(3) td:nth-child(3)").text(GetData(region, 'develop')[0].m_tri_r_ratio);
  $(".tripzoid-table tr:nth-child(4) td:nth-child(1)").text(GetData(region, 'implement')[0].m_tri_l_ratio);
  $(".tripzoid-table tr:nth-child(4) td:nth-child(3)").text(GetData(region, 'implement')[0].m_tri_r_ratio);
  $(".tripzoid-table tr:nth-child(5) td:nth-child(1)").text(GetData(region, 'launch')[0].m_tri_l_ratio);
  $(".tripzoid-table tr:nth-child(5) td:nth-child(3)").text(GetData(region, 'launch')[0].m_tri_r_ratio);
}