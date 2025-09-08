//Load Boundary
var boundary = ee.Geometry.Rectangle([79.25, 29.0, 81.25, 30.75]);
Map.centerObject(boundary);
Map.addLayer(boundary);
//__________________________________________________________________
//Load Grid Points (Kali Region)

var points = ee.FeatureCollection([
////#### YOUR POINTS ####\\\\
]);
Map.addLayer(points, {color: 'red'}, 'Grid Points');
//__________________________________________________________________
//Load DEM and Clip to Boundary
var dem = ee.Image("USGS/SRTMGL1_003").clip(boundary);
Map.addLayer(dem,{min: 213, max: 6280, palette: ['blue', 'green', 'brown', 'white']}, 'DEM');
//__________________________________________________________________
//Sample Elevation at Native 30m Resolution and Export
var sampled_native = dem.sampleRegions({
  collection: points,
  properties: ['GridsKali'],
  scale: 30,
  geometries: true
});

print('Elevation values at native resolution:', sampled_native);

Export.table.toDrive({
  collection: sampled_native,
  folder : 'Kali_Hydro_Clim',
  description: 'Kali_GridPoints_Elevation_30m',
  fileFormat: 'CSV'
});

Export.image.toDrive({
  image : dem,
  scale : 30,
  description: 'Kali_DEM_30m',
  crs : 'EPSG:4326',
  folder : 'Kali_Hydro_Clim',
  fileNamePrefix: 'DEM_Kali_30m',
  region: boundary,
  maxPixels: 1e13
})
//__________________________________________________________________
//Resample DEM to ~0.25° and Sample Elevation
var dem_resampled = dem
  .resample('bilinear')
  .reproject({
    crs: 'EPSG:4326',
    scale: 0.25 * 111320
  });

var sampled_resampled = dem_resampled.sampleRegions({
  collection: points,
  properties: ['GridsKali'],
  scale: 27830,
  geometries: true
});

print('Elevation values (resampled):', sampled_resampled);

Export.table.toDrive({
  collection: sampled_resampled,
  folder : 'Kali_Hydro_Clim',
  description: 'Kali_GridPoints_Elevation_0_25deg',
  fileFormat: 'CSV'
});
Export.image.toDrive({
  image : dem_resampled,
  scale : 27830,
  crs : 'EPSG:4326',
  description: 'Kali_DEM_0_25deg',
  folder : 'Kali_Hydro_Clim',
  fileNamePrefix: 'DEM_Kali_0_25deg',
  region: boundary,
  maxPixels: 1e13
})
Map.addLayer(dem_resampled, {min: 0, max: 4000, palette: ['blue', 'green', 'brown', 'white']}, 'DEM Resampled');
//__________________________________________________________________
//Compute Slope from DEM
var slope = ee.Terrain.slope(dem);
Map.addLayer(slope, {min: 0, max: 15, palette: ['white', 'yellow', 'orange', 'red']}, 'Slope (30m)');
//__________________________________________________________________ 
//Sample Slope at Native 30m Resolution and Export
var sampled_slope_native = slope.sampleRegions({
  collection: points,
  properties: ['GridsKali'],
  scale: 30,
  geometries: true
});

print('Slope values at native resolution:', sampled_slope_native);

Export.table.toDrive({
  collection: sampled_slope_native,
  folder : 'Kali_Hydro_Clim',
  description: 'Kali_GridPoints_Slope_30m',
  fileFormat: 'CSV'
});

Export.image.toDrive({
  image : slope,
  scale : 30,
  description: 'Kali_Slope_30m',
  crs : 'EPSG:4326',
  folder : 'Kali_Hydro_Clim',
  fileNamePrefix: 'Slope_Kali_30m',
  region: boundary,
  maxPixels: 1e13
});
//__________________________________________________________________
//Resample Slope to ~0.25° and Export
var slope_resampled = slope
  .resample('bilinear')
  .reproject({
    crs: 'EPSG:4326',
    scale: 0.25 * 111320
  });

Map.addLayer(slope_resampled, {min: 0, max: 15, palette: ['white', 'yellow', 'orange', 'red']}, 'Slope Resampled');

var sampled_slope_resampled = slope_resampled.sampleRegions({
  collection: points,
  properties: ['GridsKali'],
  scale: 27830,
  geometries: true
});

print('Slope values (resampled):', sampled_slope_resampled);

Export.table.toDrive({
  collection: sampled_slope_resampled,
  folder : 'Kali_Hydro_Clim',
  description: 'Kali_GridPoints_Slope_0_25deg',
  fileFormat: 'CSV'
});

Export.image.toDrive({
  image : slope_resampled,
  scale : 27830,
  crs : 'EPSG:4326',
  description: 'Kali_Slope_0_25deg',
  folder : 'Kali_Hydro_Clim',
  fileNamePrefix: 'Slope_Kali_0_25deg',
  region: boundary,
  maxPixels: 1e13
});
//__________________________________________________________________
//Compute Aspect from DEM
var aspect = ee.Terrain.aspect(dem);
Map.addLayer(aspect, {min: 0, max: 360, palette: ['purple', 'cyan', 'green', 'yellow']}, 'Aspect (30m)');
//__________________________________________________________________
//Sample Aspect at Native 30m Resolution and Export
var sampled_aspect_native = aspect.sampleRegions({
  collection: points,
  properties: ['GridsKali'],
  scale: 30,
  geometries: true
});

print('Aspect values at native resolution:', sampled_aspect_native);

Export.table.toDrive({
  collection: sampled_aspect_native,
  folder : 'Kali_Hydro_Clim',
  description: 'Kali_GridPoints_Aspect_30m',
  fileFormat: 'CSV'
});

Export.image.toDrive({
  image : aspect,
  scale : 30,
  description: 'Kali_Aspect_30m',
  crs : 'EPSG:4326',
  folder : 'Kali_Hydro_Clim',
  fileNamePrefix: 'Aspect_Kali_30m',
  region: boundary,
  maxPixels: 1e13
});
//__________________________________________________________________
//Resample Aspect to ~0.25° and Export
var aspect_resampled = aspect
  .resample('bilinear')
  .reproject({
    crs: 'EPSG:4326',
    scale: 0.25 * 111320
  });

Map.addLayer(aspect_resampled, {min: 0, max: 360, palette: ['purple', 'cyan', 'green', 'yellow']}, 'Aspect Resampled');

var sampled_aspect_resampled = aspect_resampled.sampleRegions({
  collection: points,
  properties: ['GridsKali'],
  scale: 27830,
  geometries: true
});

print('Aspect values (resampled):', sampled_aspect_resampled);

Export.table.toDrive({
  collection: sampled_aspect_resampled,
  folder : 'Kali_Hydro_Clim',
  description: 'Kali_GridPoints_Aspect_0_25deg',
  fileFormat: 'CSV'
});

Export.image.toDrive({
  image : aspect_resampled,
  scale : 27830,
  crs : 'EPSG:4326',
  description: 'Kali_Aspect_0_25deg',
  folder : 'Kali_Hydro_Clim',
  fileNamePrefix: 'Aspect_Kali_0_25deg',
  region: boundary,
  maxPixels: 1e13
});


//HEre bilinear interpolation is executed , you can use bicubic by using .resample('bicubic') instead of .resample('bilinear')



