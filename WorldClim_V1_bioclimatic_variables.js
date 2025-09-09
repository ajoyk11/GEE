var aoi = ee.Geometry.Polygon([[[77.62, 28.74],[81.45, 28.74],[81.45, 31.38],[77.62, 31.38],[77.62, 28.74]]]);
var WC = ee.Image("WORLDCLIM/V1/BIO")
Map.centerObject(aoi,8)
var data = WC.clip(aoi)
print(data)
Map.addLayer(data)
Export.image.toDrive({image: data,
  description: "UK_WC_Data",
  crs : 'EPSG:32644',
  scale: 1000,
  folder: 'Earth engine',
  region: aoi,
  fileFormat:'GeoTIFF',
  
  maxPixels: 1e9
})