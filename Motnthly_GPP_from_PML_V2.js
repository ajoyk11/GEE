var aoi = ee.FeatureCollection('projects/________/assets/________');
Map.addLayer(aoi,{}, 'Main')
//__________________________________________________
var aoi = ee.Geometry.Rectangle([77.75, 32.25, 79.5, 34.75]);
Map.centerObject(aoi);
Map.addLayer(aoi, {color: 'blue'}, 'AOI');
//__________________________________________________
var img = ee.ImageCollection("______________________")
.filterBounds(aoi)
.filterDate('2025-01-01', '2025-08-01')
.select('GPP');
print(img)
//__________________________________________________

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
var collection = Rescaled;
//__________________________________________________
var imgClipped = collection.map(function(image) {
  return image.clip(aoi);
});
//__________________________________________________
var startYear = 2000;
var endYear = 2025;
var bandName = "GPP";

var monthBandList = ee.List([]);

for (var yr = startYear; yr <= endYear; yr++) {
  for (var mo = 1; mo <= 12; mo++) {
    var start = ee.Date.fromYMD(yr, mo, 1);
    var end = start.advance(1, "month");
    var filtered = imgClipped.filterDate(start, end).select(bandName); //here imgClipped the Collection
    var count = filtered.size();

    var bandLabel = 'GPP_' + yr + '_' + (mo < 10 ? '0' + mo : mo);

    // Force ALL bands to Float32
    var monthlyImg = ee.Image(
      ee.Algorithms.If(
        count.gt(0), 
        filtered.sum().toFloat().rename([bandLabel]),  //  Float32
        ee.Image(0).toFloat().rename([bandLabel])      //  Float32
      )
    );
    monthBandList = monthBandList.add(monthlyImg);
  }
}
var monthlyBandImage = ee.ImageCollection.fromImages(monthBandList).toBands().clip(aoi);
//__________________________________________________
Map.addLayer(monthlyBandImage.select([1]), 
  {min:0, max:10, palette:['red', 'orange', 'yellow', 'lightgreen', 'green']}, 
  'Monthly GPP');
//__________________________________________________
Export.image.toDrive({
  image: monthlyBandImage,
  description: 'GPP_______',
  folder: 'Earth engine',
  scale: 27550,
  crs: 'EPSG:4326',
  region: aoi.geometry,
  maxPixels: 1e13
});
