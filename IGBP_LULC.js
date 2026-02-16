var aoi = ee.Geometry.Rectangle([82.95872867001023, 26.44836312809755, 83.77995669735398, 26.983196569043436])
Map.centerObject(aoi)
Map.addLayer(aoi)

var lc = ee.ImageCollection("MODIS/061/MCD12Q1")
.select('LC_Type1')
//.filterDate('2023-01-01','2023-12-31').first().clip(aoi)
.map(function(lc) {return lc.clip(aoi)})

var years =lc.toList(lc.size()) //image List or just by ee.List.sequence(2001, EndingYear) 
.map(function(img) { var year = ee.Date(ee.Image(img).get('system:time_start')).get('year'); return year; });

var bands = years.map(function(y) { return ee.String('LC_').cat(ee.Number(y).int().format())})
var ic = lc.toBands().rename(bands)

print(ic)
Map.addLayer(ic)

Export.image.toDrive({ 
image: ic, 
description: 'MODIS_LandCover_IGBP', 
folder: 'Earth engine', 
fileNamePrefix: 'LandCover_AOI', 
region: aoi, scale: 500, 
crs: 'EPSG:4326'})
  
//https://lpdaac.usgs.gov/documents/1409/MCD12_User_Guide_V61.pdf ; page no 9
// CItation https://doi.org/10.5067/MODIS/MCD12Q1.061
