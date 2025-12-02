var aoi = ee.Geometry.Rectangle([77.75, 32.25, 79.5, 34.75])
Map.centerObject(aoi)
Map.addLayer(aoi)
// __________________________________________
var modis = ee.ImageCollection("MODIS/061/MOD17A3HGF")
  .filterBounds(aoi)
  .filterDate('2001-01-01', '2023-12-31')
  .select('Npp')
  .map(function(img){ 
    return img.reproject('EPSG:4326', null, 500) // force reprojection
  })
// __________________________________________
var nppList = ee.List([])

for (var yr = 2001; yr <= 2023; yr++) {
  var start = ee.Date.fromYMD(yr, 1, 1)
  var end   = start.advance(1, "year")

  var filtered = modis.filterDate(start, end)
  var count = filtered.size()

  var bandLabel = 'NPP_' + yr

  var yearImg = ee.Image(
    ee.Algorithms.If(
      count.gt(0),
      filtered.sum()              // annual product, one image per year same for .first and .sum
        .multiply(0.0001)           // scale factor
        .toFloat()
        .rename([bandLabel]),
      ee.Image(0).toFloat().rename([bandLabel])
    )
  ).clip(aoi)

  nppList = nppList.add(yearImg)
}
// __________________________________________
var nppBandImage = ee.ImageCollection.fromImages(nppList)
  .toBands()
  .rename(
    nppList.map(function(img) {
      return ee.Image(img).bandNames().get(0)
    })
  )
  .clip(aoi)
// __________________________________________
Map.addLayer(nppBandImage.select('NPP_2020'),{min: 0, max: 1, palette:['red','orange','yellow','lightgreen','green']}, 'NPP_2020')
// __________________________________________
Export.image.toDrive({
  image: nppBandImage,
  description: 'MODIS_NPP_Yearly_2001_2023',
  folder: 'Earth engine',
  scale: 500,
  crs: 'EPSG:4326',
  region: aoi,
  maxPixels: 1e13
})
