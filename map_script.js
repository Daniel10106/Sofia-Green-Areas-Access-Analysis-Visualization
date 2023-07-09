var map = L.map('map').setView([42.698334, 23.319941], 15);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let admLayer = null;
let urbLayer = null; 
let urbMonLayer = null;
let greenAreasLayers = new Array(8);
let mountainAreasLayers = new Array(10);
let greenIndex = 0;
let monIndex = 0;
var info = L.control();

const greeneryStyle = {
  "color": "#007800",
  "fillColor": "#007800",
  "weight": 1,
  "opacity": 1,
  "fillOpacity": 1
};

const mountainStyle = {
  "color": "#7777FF",
  "weight": 2,
  "opacity": 0.8
}

const roadStyle = {
  "color": "#FFFFFF",
  "weight": 1,
  "opacity": 0.4
}

const rangeStyle = {
  "color": "#007800",
  "weight": 2,
  "opacity": 0.8
}

function getColor(d) {
  return d > 70 ? '#AAEDA0':
  d > 50 ? '#DDF27C' :
  d > 40 ? '#FDBD3C' :
  d > 30 ? '#FD8D3C' :
  d > 20 ? '#FC4E2A' :
  d > 10 ? '#E31A1C' :
  '#BD0026';
}

function getMonsColor(d) {
  return d > 80 ? '#0E3747' :
  d > 60 ? '#0F6E82' :
  d > 50 ? '#3ABAAF' :
  d > 30 ? '#9FE2BD' :
  d > 10 ? '#DFEBD3' :
  '#FFFFFF';
}

function admStyle(feature) {
  return {
    fillColor: getColor(feature.properties.percentage),
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7
};
}

function monsStyle(feature) {
  return {
    fillColor: getMonsColor(feature.properties.percentage),
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7
};
}

function highlightFeature(e) {
  var layer = e.target;
  
  layer.setStyle({
    weight: 5,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.7
  });
  
  layer.bringToFront();
  info.update(layer.feature.properties);
}

function resetHighlight(e) {
  if (granularity === "adm_districts") {
    admLayer.resetStyle(e.target);
  }
  else if (granularity === "urb_units") {
    urbLayer.resetStyle(e.target);
  }
  info.update();
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
  });
}

async function loadGeoJson(geojson, style) {
  const response = await fetch(geojson);
  const data = await response.json();
  greenAreasLayers[greenIndex++] = L.geoJson(data, { style: style }).addTo(map);
}

async function loadMonsGeoJson(geojson, style) {
  const response = await fetch(geojson);
  const data = await response.json();
  mountainAreasLayers[monIndex++] = L.geoJson(data, { style: style }).addTo(map);
}

async function loadAdmGeoJson(geojson, style) {
  const response = await fetch(geojson);
  const data = await response.json();
  admLayer = L.geoJson(data, { style: style, onEachFeature: onEachFeature }).addTo(map);
}

async function loadUrbGeoJson(geojson, style) {
  const response = await fetch(geojson);
  const data = await response.json();
  urbLayer = L.geoJson(data, { style: style, onEachFeature: onEachFeature }).addTo(map);
}

async function loadUrbMonGeoJson(geojson, style) {
  const response = await fetch(geojson);
  const data = await response.json();
  urbLayer = L.geoJson(data, { style: style, onEachFeature: onEachFeature }).addTo(map);
}

let mode = "stats";
let granularity = "adm_districts";
let greenAreaType = "parks";

function loadHeatmap() {
  loadGeoJson("green_areas.geojson", greeneryStyle);
  loadGeoJson("parks_range_400m.geojson", rangeStyle);
  loadGeoJson("parks_range_300m.geojson", rangeStyle);
  loadGeoJson("parks_range_200m.geojson", rangeStyle);
  loadGeoJson("parks_range_100m.geojson", rangeStyle);
  loadGeoJson("parks_walks_300m.geojson", roadStyle);
  loadGeoJson("parks_walks_200m.geojson", roadStyle);
  loadGeoJson("parks_walks_100m.geojson", roadStyle);
}

function loadMonHeatmap() {
  loadMonsGeoJson("mons_range_750m.geojson", mountainStyle);
  loadMonsGeoJson("mons_range_600m.geojson", mountainStyle);
  loadMonsGeoJson("mons_range_450m.geojson", mountainStyle);
  loadMonsGeoJson("mons_range_300m.geojson", mountainStyle);
  loadMonsGeoJson("mons_range_150m.geojson", mountainStyle);
  loadMonsGeoJson("mons_walks_750m.geojson", roadStyle);
  loadMonsGeoJson("mons_walks_600m.geojson", roadStyle);
  loadMonsGeoJson("mons_walks_450m.geojson", roadStyle);
  loadMonsGeoJson("mons_walks_300m.geojson", roadStyle);
  loadMonsGeoJson("mons_walks_150m.geojson", roadStyle);
}

loadHeatmap();

function loadParksGreenMap() {
  unloadStatAdm();
  unloadStatUrb();
  unloadStatUrbMon();
  unloadMountainAreas();

  if (mode="stats"){
    map.removeControl(info);
    map.removeControl(legend);
  }
  mode="heatmap";
  greenIndex = 0;
  loadHeatmap();
}

function loadMonsMap() {
  unloadStatAdm();
  unloadStatUrb();
  unloadStatUrbMon();
  unloadGreenAreas();
  
  if (mode="stats"){
    map.removeControl(info);
    map.removeControl(legend);
  }
  mode="heatmap";
  monIndex = 0;
  loadMonHeatmap();
}

function loadStatAdmMap() {
  unloadStatUrb();
  unloadStatUrbMon();
  unloadGreenAreas();
  unloadMountainAreas();

  loadAdmGeoJson("adm_regions_score.geojson", admStyle);
  granularity = "adm_districts";
  greenAreaType = "parks";
  legend.addTo(map);
  info.addTo(map);
  mode="stats";
}

function loadStatUrbMap() {
  unloadStatAdm();
  unloadStatUrbMon();
  unloadGreenAreas();
  unloadMountainAreas();
  
  loadUrbGeoJson("urb_units_score.geojson", admStyle);
  granularity = "urb_units";
  greenAreaType = "parks";
  legend.addTo(map);
  info.addTo(map);
  mode="stats";
}

function loadStatUrbMonsMap() {
  unloadStatAdm();
  unloadStatUrb();
  unloadGreenAreas();
  unloadMountainAreas();

  loadUrbMonGeoJson("urb_units_mons_score.geojson", monsStyle);
  granularity = "urb_units";
  greenAreaType = "mountains";
  legend.addTo(map);
  info.addTo(map);
  mode="stats";
}

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

info.update = function (props) {
  if (mode == "stats" && granularity == "adm_districts") {
    this._div.innerHTML = '<h4>Административен район</h4>' + '<div class="info_block">' + (props ?
      '<b>' + props.obns_cyr + '</b><br />' + props.percentage.toFixed(2) + '% от пешеходните пътища са в близост до парк'
        : 'Задръжте върху административен район') + '</div>';
  }
  else if (mode == "stats" && granularity == "urb_units") {
    this._div.innerHTML = '<h4>Адм. район ' + (props ? props.rajon.toUpperCase() : 'неизвестен') + '</h4>' + '<div class="info_block">' +  (props ?
      '<b>' + props.regname + '</b><br />' + props.percentage.toFixed(2) + '% от пешеходните пътища са в близост до парк'
        : 'Задръжте върху административен район') + '</div>';
  }
};

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [100, 70, 50, 40, 30, 20, 10],
        monGrades = [100, 80, 60, 50, 30, 10],
        labels = [];

    if (greenAreaType == "parks") {
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i]) + '"></i> ' +
              (grades[i]) + (grades[i + 1] ? '&ndash;' + (grades[i + 1]) + '<br>' : '-');
      }
    }

    else if (greenAreaType == "mountains") {
      for (var i = 0; i < monGrades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getMonsColor(monGrades[i]) + '"></i> ' +
            (monGrades[i]) + (monGrades[i + 1] ? '&ndash;' + (monGrades[i + 1]) + '<br>' : '-');
      }
    }

    return div;
};



var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);

function unloadGreenAreas() {
  if (greenAreasLayers[0] != null && map.hasLayer(greenAreasLayers[0])) {
    for (i = 0; i < 8; i++) {
      map.removeLayer(greenAreasLayers[i]);
    }
  }
}

function unloadMountainAreas() {
  if (mountainAreasLayers[0] != null && map.hasLayer(mountainAreasLayers[0])) {
    for (i = 0; i < 10; i++) {
      map.removeLayer(mountainAreasLayers[i]);
    }
  }
}

function unloadStatAdm() {
  if (admLayer != null && map.hasLayer(admLayer)) {
    map.removeLayer(admLayer);
  }
}

function unloadStatUrb() {
  if (urbLayer != null && map.hasLayer(urbLayer)) {
    map.removeLayer(urbLayer);
  }
}

function unloadStatUrbMon() {
  if (urbMonLayer != null && map.hasLayer(urbMonLayer)) {
    map.removeLayer(urbMonLayer);
  }
}
