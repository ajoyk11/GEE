var aoi = ee.Geometry.Rectangle([77.75, 32.25, 79.5, 34.75])
Map.centerObject(aoi)
Map.addLayer(aoi)
// __________________________________________________________
var img = ee.ImageCollection("CAS/IGSNRR/PML/V2_v018")
.filterBounds(aoi)
.filterDate('2000-01-01', '2023-12-31')
.select('GPP')
// __________________________________________________________
var julyList = ee.List([]);

for (var yr = 2000; yr <= 2023; yr++) {   //start and end year

  var start = ee.Date.fromYMD(yr, 7, 1);
  var end   = start.advance(1, "month");

  var filtered = img.filterDate(start, end).select("GPP");
  var count = filtered.size();

  var bandLabel = 'GPP_' + yr + '_07';

  var julyImg = ee.Image(
    ee.Algorithms.If(
      count.gt(0),
      filtered.sum().toFloat().rename([bandLabel]),// you can get filtered.mean() for monthly average
      ee.Image(0).toFloat().rename([bandLabel])
    )
  ).clip(aoi);

  julyList = julyList.add(julyImg);
}

// __________________________________________________________
var julyBandImage = ee.ImageCollection.fromImages(julyList)
  .toBands()
  .rename(
    julyList.map(function(img) {
      return ee.Image(img).bandNames().get(0);
    })
  )
  .clip(aoi)
// __________________________________________________________
Map.addLayer(julyBandImage.select('GPP_2023_07'),{min:0, max:2, palette:['red','orange','yellow','lightgreen','green']},'Test_GPP')
// __________________________________________________________
Export.image.toDrive({
  image: julyBandImage,
  description: 'GPP_July_2000_2023',
  folder: 'Earth engine',
  scale: 500,
  crs: 'EPSG:4326',
  region: aoi,
  maxPixels: 1e13
})
