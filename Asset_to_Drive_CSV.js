var points = ee.FeatureCollection('projects/ajoyiirs/assets/------')
Map.addLayer(points)
Map.centerObject(points)
Export.table.toDrive({
collection: points,
description: 'Export_to_Drive',
//folder: 'Obj1',  
fileNamePrefix: '_____e__with_variables',
fileFormat: 'CSV'
})
