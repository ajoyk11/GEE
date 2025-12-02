var aoi = ee.Geometry.Rectangle([77.75, 32.25, 79.5, 34.75])
Map.centerObject(aoi)
Map.addLayer(aoi)
// __________________________________________
var modis = ee.ImageCollection("MODIS/061/MOD17A3HGF")
  .filterBounds(aoi)
  .filterDate('2001-01-01', '2023-12-31')
  .select('Gpp')
  .map(function(img){ 
    return img.reproject('EPSG:4326', null, 500) // reproject to WGS84
  })
// __________________________________________
var gppList = ee.List([])

for (var yr = 2001; yr <= 2023; yr++) {
  var start = ee.Date.fromYMD(yr, 1, 1)
  var end   = start.advance(1, "year")

  var filtered = modis.filterDate(start, end)
  var count = filtered.size()

  var bandLabel = 'GPP_' + yr

  var yearImg = ee.Image(
    ee.Algorithms.If(
      count.gt(0),
      filtered.first()              // one image per year
        .multiply(0.0001)           // scale factor
        .toFloat()
        .rename([bandLabel]),
      ee.Image(0).toFloat().rename([bandLabel])
    )
  ).clip(aoi)

  gppList = gppList.add(yearImg)
}
// __________________________________________
var gppBandImage = ee.ImageCollection.fromImages(gppList)
  .toBands()
  .rename(
    gppList.map(function(img) {
      return ee.Image(img).bandNames().get(0)
    })
  )
  .clip(aoi)
// __________________________________________
Map.addLayer(  gppBandImage.select('GPP_2020'),  {min: 0, max: 6, palette:['red','orange','yellow','lightgreen','green']},  'GPP_2020')
// __________________________________________
// Export
Export.image.toDrive({
  image: gppBandImage,
  description: 'MODIS_GPP_Yearly_2001_2023',
  folder: 'Earth engine',
  scale: 500,
  crs: 'EPSG:4326',
  region: aoi,
  maxPixels: 1e13
})
