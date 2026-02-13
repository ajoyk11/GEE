var aoi = ee.FeatureCollection('projects/ajoyiirs/---')
Map.centerObject(aoi, 9)
Map.addLayer(aoi)

var lst = ee.ImageCollection("ASTER/AST_L1T_003")
.filterDate("2022-01-01", "2024-10-01")
.filterBounds(aoi)
.filter(ee.Filter.listContains('ORIGINAL_BANDS_PRESENT', 'B13'))
.filter(ee.Filter.lt('CLOUDCOVER', 20))
.map(function(img) {
    var dn = img.select('B13');
    //Convert DN to Radiance (NORMAL gain)
    var radiance = dn.subtract(1)
                     .multiply(0.006882)
                     .updateMask(dn.gt(1));
    // Mask zero/negative radiance
    radiance = radiance.updateMask(radiance.gt(0));
    //Brightness Temperature (Planck inversion)
    var k1 = ee.Image(1588.5);
    var k2 = ee.Image(1465.5);
    var BT_K = k2.divide(k1.divide(radiance).log());
    //Thermal realism mask
    BT_K = BT_K.updateMask(
              BT_K.gt(200).and(BT_K.lt(320))
            );

    //Emissivity Correction (Glacier E = 0.98)
    var lambda = ee.Image(10.6e-6);   // Band 13 wavelength (m)
    var rho = ee.Image(1.438e-2);     // h*c/sigma (m*K)
    var emissivity = ee.Image(0.98);

    var lstK = BT_K.divide(
      ee.Image(1).add(
        lambda.multiply(BT_K)
              .divide(rho)
              .multiply(emissivity.log())
      )
    )
    //Convert to Celsius
    var lstC = lstK.subtract(273.15).rename('LST_C')
    return lstC.clip(aoi)
      .copyProperties(img, ["system:time_start"])
  })

var aster_daily = ee.FeatureCollection(
  lst.map(function(img) {
    var meanDict = img.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: aoi.geometry(),
      scale: 90,
      maxPixels: 1e9
    })
    var date = ee.Date(img.get('system:time_start'))
    return ee.Feature(null, {
      'date': date.format('YYYY-MM-dd'),
      'LST_C': meanDict.get('LST_C')
    })
  })
)

print(lst.size())
print(aster_daily.limit(5))

Export.table.toDrive({
collection: aster_daily,
description: 'ASTER_LST_',
fileFormat: 'CSV',
selectors: ['date', 'LST_C']})
