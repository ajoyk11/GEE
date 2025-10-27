var aoi = ee.FeatureCollection('projects/_____/assets/AREA')

var img = ee.ImageCollection("COLLECTION")
.filterBounds(aoi)
.filterDate('2000-01-01','2025-08-30')
.select('BAND')

print(img)
//Map.addLayer(img)

var imgClipped = img.map(function(img) {
  return img.clip(aoi);
});


var first = imgClipped.first()

var vis_p = {
  min: 0,
  max: 10,
  palette: ['red', 'orange', 'yellow', 'lightgreen', 'green']
};
Map.addLayer(first, vis_p, 'LAYER1')
