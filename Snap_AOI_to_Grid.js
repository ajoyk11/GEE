var aoi = ee.FeatureCollection('projects/ajoyiirs/assets/India_Boundary');
var geom = aoi.geometry();

var step = 0.25;

// Get AOI bounding box
var bounds = geom.bounds();

// Extract coordinates of bounding box
var coords = ee.List(bounds.coordinates().get(0));
var ll = ee.List(coords.get(0)); // lower-left
var ur = ee.List(coords.get(2)); // upper-right

var lonMin = ee.Number(ll.get(0)).divide(step).floor().multiply(step);
var latMin = ee.Number(ll.get(1)).divide(step).floor().multiply(step);
var lonMax = ee.Number(ur.get(0)).divide(step).ceil().multiply(step);
var latMax = ee.Number(ur.get(1)).divide(step).ceil().multiply(step);

// Build sequences
var lons = ee.List.sequence(lonMin, lonMax.subtract(step), step);
var lats = ee.List.sequence(latMin, latMax.subtract(step), step);

// Build grid of 0.25° rectangles
var grid = ee.FeatureCollection(
  lons.map(function(lon){
    lon = ee.Number(lon);
    return lats.map(function(lat){
      lat = ee.Number(lat);
      var cell = ee.Geometry.Rectangle([lon, lat, lon.add(step), lat.add(step)], null, false);
      return ee.Feature(cell);
    });
  }).flatten()
);

// Select only cells that intersect AOI
var intersecting = grid.filterBounds(geom);

// Merge into one stepped polygon
var preciseSnapped = intersecting.geometry().dissolve(1).buffer(0, 1);

// Show results
Map.centerObject(geom);
Map.addLayer(geom, {color: 'black'}, 'AOI');
Map.addLayer(preciseSnapped, {color: 'red'}, 'Snapped 0.25° AOI Grid Fit');

var fc = ee.FeatureCollection([ee.Feature(preciseSnapped)]);

Export.table.toDrive({
  collection: fc,
  description: 'preciseSnapped',
  fileNamePrefix: 'India_Snapped_025D',
  fileFormat: 'GeoJSON'
});
