// Store path to json file in a variable
let queryPath = 'adv_unemp_funds.json';
// let state_unemp_debt = undefined;

let myMap = undefined;

// Inital view selected upon page load
buildCharts(2021);

// Regenerate page when different year is selected
function buildCharts(selected_year) {
    

    if (myMap != undefined) {
        d3.select('#map').html('');
        myMap.off();
        myMap.remove();
    }

    // Read data in json file
    d3.json(queryPath).then(function(data) {
        // Load data to console
        console.log(data);

        // List of years of data
        years = [2021, 2020, 2017, 2016];
        // print to console
        console.log(years);

        // Populate Dropdown Menu
        let dropdown = d3.select("#selDataset");
        for (i=0; i< years.length; i++) {
            dropdown.append('option').text(years[i]);
        }

        let data_by_year = selectData(selected_year, data);
        let target_data = data_by_year.filtered_data;
        let latlngs = data_by_year.filtered_latlngs;

        let state_unemp_debt = createLayer(target_data, latlngs);
        createMap(state_unemp_debt)
    });
};

// Function that selects color of marker by the state's outstanding advanced balance
function fillColor(target_data) {
    let balance = target_data.outstanding_adv_balance;

    if (balance > 6000000000) {
        return '#f06b6b'; 
    }
    else if (balance >= 3000000000) {
        return '#f0936b';
    }
    else if (balance >= 1000000000) {
        return '#f3ba4e';
    }
    else if (balance >= 800000000) {
        return '#f3db4c';
    }
    else if (balance >= 600000000) {
        return '#e1f34c';
    }
    return '#b7f34d';  
}

// Function that determines radius of the circle marker
function radius(target_data) {
    balance = target_data.outstanding_adv_balance;
    let rad = balance/100000000;

    return rad;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

// Create a function that makes a circle marker and popup for each state in dataset
function createLayer(target_data, latlngs) {

    // Create circle markers
    let markers = []
    for (i=0; i< target_data.length; i++) {
        let m = L.circleMarker(latlngs[i], {
            radius: radius(target_data[i]),
            color: 'black',
            fillColor: fillColor(target_data[i]),
            fillOpacity: .75,
            weight: 1
        });

        m.bindPopup(`<h4>${target_data[i].state}</h4>
            <hr></hr>
            <h5>Estimated Population: ${numberWithCommas(target_data[i].population)}</h5>
            <h5>Outstanding Advance Balance: $${numberWithCommas(target_data[i].outstanding_adv_balance)}</h5>
            <h5>Interest Accrued (YTD): $${numberWithCommas(target_data[i].interest_accrued_ytd)}</h5>
            <h5>Outstanding Balance per Person: $${numberWithCommas(target_data[i].outstanding_adv_balance/target_data[i].population)}</h5>`
        );

        markers.push(m);
    }

    // Put it all together in a layer group
    let state_unemp_debt = L.layerGroup(markers);

    // Send layer to new 'createMap' function
    //createMap(state_unemp_debt, latlngs);
    return state_unemp_debt
};

function createMap(state_unemp_debt) {

    // Create the first tile layer that will be the background of our map.
    let streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        accessToken: API_KEY
    });

    // Create the second tile layer that will be the background of our map.
    let satellite = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        accessToken: API_KEY
    });

    // Put tile layers in baseMaps object
    let baseMaps = {
        'Street View': streets,
        'Satellite View': satellite
    };
        
    // Put unemployment data layer in overlayMaps object
    let overlayMaps = {
        AdvancedStateUnemploymentFunds: state_unemp_debt
    };

    // Create map, giving it the streetmap and State Unemployment Funding/Debt layers to display on load.
    myMap = L.map("map", {
        center: [
        36.778259, -119.417931
        ],
        zoom: 4,
        layers: [streets, state_unemp_debt]
    });
    
    // Create a layer control 
    // and give it baseMaps and overlayMaps so user can select prefered view.
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
    }).addTo(myMap);   
}


// function to reload page when new year is selected
function optionChanged(year) {
    console.log(year);
    buildCharts(year);
    // d3.json(queryPath).then(function(data) {
    //     let data_by_year = selectData(year, data);
    //     let target_data = data_by_year.filtered_data;
    //     let latlngs = data_by_year.filtered_latlngs;

    //     state_unemp_debt = createLayer(target_data, latlngs);
    // });
}

// Filter data by year
function selectData(year, data) {
    // console.log(data);
    let filtered_data = data.filter(item => item.year == year);
    console.log(filtered_data);

    let filtered_latlngs = [];
    for (i=0; i < filtered_data.length; i++) {
        filtered_latlngs.push([filtered_data[i].coordinates[0], filtered_data[i].coordinates[1]]);
    }

    return {
        filtered_data: filtered_data,
        filtered_latlngs: filtered_latlngs
    };
}