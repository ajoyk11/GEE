var aoi = ee.Geometry.Rectangle([88.50, 26, 90.50, 27.00]);

Map.addLayer(aoi)
Map.centerObject(aoi)

// Load the ImageCollection
var ic = ee.ImageCollection("LANDSAT/LC09/C02/T1_TOA")
.filterBounds(aoi)

// Get the first image and its date
var firstImg = ic.sort('system:time_start', true).first();
var firstDate = ee.Date(firstImg.get('system:time_start'));
print('First Date:', firstDate);

// Get the last image and its date
var lastImg = ic.sort('system:time_start', false).first();
var lastDate = ee.Date(lastImg.get('system:time_start'));
print('Last Date:', lastDate);
