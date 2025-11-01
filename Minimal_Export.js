var aoi = ee.Geometry.Rectangle([77.75, 30, 78.5, 30.75])

Map.centerObject(aoi)
Map.addLayer(aoi)

var s2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
.filterBounds(aoi)
.filterDate('2020-06-06', '2024-09-30')
.first()
.clip(aoi)
print(s2)

Map.addLayer(s2)



Export.image.toDrive({
image: img.toFloat(),
description: 'Sentinel_2',
scale: 30, 
region: aoi,
crs : 'EPSG:32644',
fileFormat: 'GeoTIFF',
folder : 'Earth engine',
maxPixels: 1e9})
