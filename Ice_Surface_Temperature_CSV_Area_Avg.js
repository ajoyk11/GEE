var aoi =ee.FeatureCollection('projects/ajoyiirs/assets/-----')
Map.addLayer(aoi)
Map.centerObject(aoi)
//________________________________________VIIRS________________________________________________________________
var lst = ee.ImageCollection("NASA/VIIRS/002/VNP21A1D")
.select("LST_1KM")
.filterDate("2022-01-01", "2024-12-31")
.filterBounds(aoi)
.map(function(img) {return img.clip(aoi)})
.map(function(img) {return img.subtract(273.15).copyProperties(img, ["system:time_start"])})
//.map(function(img) {return img.reproject('EPSG:4326')})//No Need
var dailyAvg = ee.FeatureCollection(
  lst.map(function(img) {
    var meanDict = img.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: aoi.geometry(),//.geometry() for asset
      scale: 1000
    })
    var date = ee.Date(img.get('system:time_start'))
    return ee.Feature(null, {
      'date': date.format('YYYY-MM-dd'),
      'LST_C': meanDict.get('LST_1KM')
    })
  })
)
print(dailyAvg.limit(10))
Export.table.toDrive({
collection: dailyAvg,
description: 'VIIRS_Daily_Ice_LST_2022_2024',
fileFormat: 'CSV',
selectors: ['date', 'LST_C']
})
var first = lst.first()
print(first)
Map.addLayer(first)
//________________________________________MODIS________________________________________________________________
var lst = ee.ImageCollection("MODIS/061/MOD11A1")
.select("LST_Day_1km")
.filterDate("2022-01-01", "2024-12-31")
.filterBounds(aoi)
.map(function(img) {return img.clip(aoi)})
//.map(function(img) {return img.reproject('EPSG:4326')})//No Need
.map(function(img) {
  var lstKelvin = img.multiply(0.02)
  var lstC = lstKelvin.subtract(273.15).updateMask(lstKelvin.gt(0))
  return lstC.copyProperties(img, ["system:time_start"])
})
var dailyAvg = ee.FeatureCollection(
  lst.map(function(img) {
    var meanDict = img.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: aoi.geometry(),
      scale: 1000
    })
    var date = ee.Date(img.get('system:time_start'))
    return ee.Feature(null, {
      'date': date.format('YYYY-MM-dd'),
      'LST_C': meanDict.get('LST_Day_1km') 
    })
  })
)
print(dailyAvg.limit(10))
Export.table.toDrive({
collection: dailyAvg,
description: 'MODIS_Daily_Ice_LST_2022_2024',
fileFormat: 'CSV',
selectors: ['date', 'LST_C']
})
//________________________________________L9________________________________________________________________
var lst9 = ee.ImageCollection("LANDSAT/LC09/C02/T1_L2")
  .filterDate("2022-01-01", "2024-12-31")
  .filterBounds(aoi)
  .filter(ee.Filter.lt('CLOUD_COVER', 20))
  .map(function(img) {
    var lstKelvin = img.select('ST_B10').multiply(0.00341802).add(149.0)
    var lstC = lstKelvin.subtract(273.15).rename('LST_C')
    return lstC.clip(aoi)
      .copyProperties(img, ["system:time_start"])
      .set('satellite', 'L9')
  })

var lst9_daily = ee.FeatureCollection(
  lst9.map(function(img) {
    var meanDict = img.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: aoi.geometry(),
      scale: 30,
      maxPixels: 1e9
    })
    var date = ee.Date(img.get('system:time_start'))
    return ee.Feature(null, {
      'date': date.format('YYYY-MM-dd'),
      'LST_C': meanDict.get('LST_C')
    })
  })
)

print('Landsat 9 images:', lst9.size())
print(lst9_daily.limit(10))

Export.table.toDrive({
collection: lst9_daily,
description: 'Landsat9_LST_2022_2024',
fileFormat: 'CSV',
selectors: ['date', 'LST_C']
})

//________________________________________L8________________________________________________________________
var lst8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
  .filterDate("2022-01-01", "2024-12-31")
  .filterBounds(aoi)
  .filter(ee.Filter.lt('CLOUD_COVER', 20))  
  .map(function(img) {
    var lstKelvin = img.select('ST_B10').multiply(0.00341802).add(149.0)
    var lstC = lstKelvin.subtract(273.15).rename('LST_C')
    return lstC.clip(aoi)
      .copyProperties(img, ["system:time_start"])
      .set('satellite', 'L8')
  })

var lst8_daily = ee.FeatureCollection(
  lst8.map(function(img) {
    var meanDict = img.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: aoi.geometry(),
      scale: 30,
      maxPixels: 1e9
    })
    var date = ee.Date(img.get('system:time_start'))
    return ee.Feature(null, {
      'date': date.format('YYYY-MM-dd'),
      'LST_C': meanDict.get('LST_C')  
    })
  })
)

print('Landsat 8 images:', lst8.size())
print(lst8_daily.limit(10))

Export.table.toDrive({
collection: lst8_daily,
description: 'Landsat8_LST_2022_2024',
fileFormat: 'CSV',
selectors: ['date', 'LST_C']
})

//________________________________________L7________________________________________________________________
var lst7 = ee.ImageCollection("LANDSAT/LE07/C02/T1_L2")
  .filterDate("2022-01-01", "2024-12-31")
  .filterBounds(aoi)
  .filter(ee.Filter.lt('CLOUD_COVER', 20))
  .map(function(img) {
    var lstKelvin = img.select('ST_B6').multiply(0.00341802).add(149.0)
    var lstC = lstKelvin.subtract(273.15).rename('LST_C')
    return lstC.clip(aoi)
      .copyProperties(img, ["system:time_start"])
      .set('satellite', 'L7')
  })

var lst7_daily = ee.FeatureCollection(
  lst7.map(function(img) {
    var meanDict = img.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: aoi.geometry(),
      scale: 30,
      maxPixels: 1e9
    })
    var date = ee.Date(img.get('system:time_start'))
    return ee.Feature(null, {
      'date': date.format('YYYY-MM-dd'),
      'LST_C': meanDict.get('LST_C')  
    })
  })
)

print('Landsat 7 images:', lst7.size())
print(lst7_daily.limit(10))

Export.table.toDrive({
collection: lst7_daily,
description: 'Landsat7_LST_2022_2024',
fileFormat: 'CSV',
selectors: ['date', 'LST_C']
})

//________________________________________Combined Landsat 7, 8, 9 LST________________________________________________________________
var lstCombined = lst7.merge(lst8).merge(lst9)
print('Total combined images:', lstCombined.size())

var lstCombined_daily = ee.FeatureCollection(
  lstCombined.map(function(img) {
    var meanDict = img.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: aoi.geometry(),
      scale: 30,
      maxPixels: 1e9
    })
    var date = ee.Date(img.get('system:time_start'))
    var satellite = img.get('satellite')
    
    return ee.Feature(null, {
      'date': date.format('YYYY-MM-dd'),
      'LST_C': meanDict.get('LST_C'),
      'satellite': satellite
    })
  })
)

print(lstCombined_daily.limit(10))

Export.table.toDrive({
collection: lstCombined_daily,
description: 'Combined_Landsat789_LST_2022_2024',
fileFormat: 'CSV',
selectors: ['date', 'LST_C', 'satellite']
})
