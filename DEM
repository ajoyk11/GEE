var aoi = ee.FeatureCollection('projects/_____')
var dem = ee.Image("USGS/SRTMGL1_003").clip(aoi) 

Export.image.toDrive({
  image : dem,
  region : aoi,
  crs : 'EPSG:4326',
  scale : 30,
  folder : "Earth engine",
  description : "DEM",
  maxPixels: 1e13
  })
