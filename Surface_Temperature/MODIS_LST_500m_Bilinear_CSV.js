var aoi = ee.FeatureCollection('projects......')
Map.addLayer(aoi)
Map.centerObject(aoi)

var lstC = ee.ImageCollection('MODIS/061/MOD11A1')
  .filterDate('2023-06-01', '2023-11-01') 
  .filterBounds(aoi)
  .select('LST_Day_1km')

var lstFeatures = lstC
  .map(function(image) {
    var date = ee.Date(image.get('system:time_start')).format('YYYY-MM-dd')

    // Convert to Celsius 
    var lstCelsius = image.multiply(0.02).subtract(273.15)

    // Reproject 
    var lstResampled = lstCelsius
      .resample('bilinear')
      .reproject({
        crs: 'EPSG:32644',
        scale: 500
      })

    var meanDict = lstResampled.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: aoi.geometry(),
      scale: 500,
      crs: 'EPSG:32644',
      maxPixels: 1e13
    })

    var meanValue = meanDict.get('LST_Day_1km')

    return ee.Feature(null, {
      'date': date,
      'LST_Celsius': meanValue
    });
  });

Export.table.toDrive({
  collection: lstFeatures,
  description: 'MODIS_LST_Daily_500m_32644',
  fileFormat: 'CSV'
})
