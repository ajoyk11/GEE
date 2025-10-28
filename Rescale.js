var aoi = ee.Geometry.Rectangle([77.75, 32.25, 79.5, 34.75])
Map.centerObject(aoi)
Map.addLayer(aoi, {color: 'blue'}, 'AOI');
//__________________________________________________
var img = ee.ImageCollection("IMAGECOLLECTION")
.filterBounds(aoi)
.filterDate('2010-01-01', '2025-01-01')
.select('BAND');




var Rescaled = img.map(function(img) {
  var reduced = img.reduceResolution({
      reducer: ee.Reducer.mean(),
      maxPixels: 10240
    })
    .reproject({
      crs: 'EPSG:4326',
      scale: 27750
    })
    .clip(aoi);
    
  return reduced.copyProperties(img, img.propertyNames());
});

var first = Rescaled.first()
print(first)
Map.addLayer(first)
