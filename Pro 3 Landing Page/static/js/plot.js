// Create an array of each year
let Y2019 = Object.values(data.Y2019);
let Y2020 = Object.values(data.Y2020);
let Y2021 = Object.values(data.Y2021);

// Create an array of state labels
let labels = Object.keys(data.Y2020);

console.log(Y2021);

// Display the default plot
function init() {
    let data = [{
        values: Y2021,
        labels: labels,
        type: "pie"
      }];

  let layout = {
    title: { text: "<b>States with Outstanding Balances from the Federal UTF</b><br> (in Millions)" },
    height: 600,
    width: 800
  };

  Plotly.newPlot("pie", data, layout);
}

// On change to the DOM, call getData()
d3.selectAll("#selDataset2").on("change", getData);

// Function called by DOM changes
function getData() {
  let dropdownMenu = d3.select("#selDataset2");
  // Assign the value of the dropdown menu option to a variable
  let dataset = dropdownMenu.property("value");
  // Initialize an empty array for the state data
  let data = [];

  if (dataset == 'Y2021') {
      data = Y2021;
  }
  else if (dataset == 'Y2020') {
      data = Y2020;
  }
  else if (dataset == 'Y2019') {
      data = Y2019;
  }
  // Call function to update the chart
  updatePlotly(data);
}

// Update the restyled plot's values
function updatePlotly(newdata) {
  Plotly.restyle("pie", "values", [newdata]);
}

init();