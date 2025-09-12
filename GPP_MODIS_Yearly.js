var aoi = ee.FeatureCollection('projects/ajoyiirs/assets/Myarea');
Map.addLayer(aoi);
Map.centerObject(aoi);

function exportGPP(year) {
  var startDate = ee.Date.fromYMD(year, 1, 1);
  var endDate = ee.Date.fromYMD(year, 12, 31);
  var dataset = ee.ImageCollection("MODIS/061/MOD17A3HGF")
                  .filterDate(startDate, endDate)
                  .filterBounds(aoi);
  var gppImage = dataset.select('Gpp').mean().multiply(0.0001).clip(aoi);
  Map.addLayer(gppImage, {min: 0, max: 1, palette: ['blue', 'green', 'yellow', 'red']}, 'GPP ' + year);
  Export.image.toDrive({
    image: gppImage,
    description: 'GPP_' + year + 'My_Area',
    folder: 'Int',
    fileNamePrefix: 'GPP_' + year + '_My_Area',
    region: aoi.geometry().bounds(),
    scale: 500,
    crs: 'EPSG:4326',
    maxPixels: 1e13
  });
}

for (var year = 2001; year <= 2024; year++) {
  exportGPP(year);
}
