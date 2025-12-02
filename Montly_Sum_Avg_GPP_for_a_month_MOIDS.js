var aoi = ee.Geometry.Rectangle([77.75, 32.25, 79.5, 34.75])
Map.centerObject(aoi)
Map.addLayer(aoi)

// __________________________________________
var modis = ee.ImageCollection("MODIS/061/MOD17A2HGF")
  .filterBounds(aoi)
  .filterDate('2021-01-01', '2023-12-31')
  .select('Gpp')
  .map(function(img){ return img.reproject('EPSG:4326', null, 500); }) //reproject

// __________________________________________
// Build list of July GPP images for each year
var julyList = ee.List([])

for (var yr = 2000; yr <= 2023; yr++) {
  var start = ee.Date.fromYMD(yr, 7, 1);
  var end   = start.advance(1, "month");

  var filtered = modis.filterDate(start, end);
  var count = filtered.size();

  var bandLabel = 'GPP_' + yr + '_07';

  var julyImg = ee.Image(
    ee.Algorithms.If(
      count.gt(0),
      filtered.sum()                // or mean
        .multiply(0.0001)            //scale factor
        .toFloat()
        .rename([bandLabel]),
      ee.Image(0).toFloat().rename([bandLabel])
    )
  ).clip(aoi);

  julyList = julyList.add(julyImg);
}

// __________________________________________
var julyBandImage = ee.ImageCollection.fromImages(julyList)
  .toBands()
  .rename(
    julyList.map(function(img) {
      return ee.Image(img).bandNames().get(0);
    })
  )
  .clip(aoi);

// __________________________________________
Map.addLayer(julyBandImage.select('GPP_2022_07'),{min: 0, max: 6, palette:['red','orange','yellow','lightgreen','green']},'GPP_Jul_2023');

// __________________________________________
Export.image.toDrive({
  image: julyBandImage,
  description: 'MODIS_GPP_July_2000_2023',
  folder: 'Earth engine',
  scale: 500,
  crs: 'EPSG:4326',
  region: aoi,
  maxPixels: 1e13
})
