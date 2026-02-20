var shapefile = ee.FeatureCollection('projects/ajoyiirs/assets/-----')
Map.addLayer(shapefile)
Map.centerObject(shapefile)

var aoi = shapefile.filter(ee.Filter.eq('Name', 'Glacier_2'))
print(aoi)
Map.addLayer(aoi, {color: 'red'}, 'AO1')
