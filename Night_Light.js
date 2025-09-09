var Ind = ee.Geometry.Polygon([[
  [68, 7], [98, 7], [98, 37], [68, 37], [68, 7]  
]]);
Map.addLayer(Ind)
Map.centerObject(Ind)

var v21 = ee.ImageCollection("NOAA/VIIRS/DNB/ANNUAL_V21")
    .filterDate("2014-01-01", "2022-01-01");
  
var v22 = ee.ImageCollection("NOAA/VIIRS/DNB/ANNUAL_V22")
    .filterDate("2022-01-01", "2025-02-25");

var exportImages = function(collection, collectionName) {
  var listOfImages = collection.toList(collection.size());  
  var count = listOfImages.size().getInfo();  

  for (var i = 0; i < count; i++) {
    var image = ee.Image(listOfImages.get(i));  
    var year = ee.Date(image.get('system:time_start')).get('year').getInfo();  

    var selectedBands = image.select(['average_masked', 'median_masked', 'cf_cvg'])  
                             .resample('bilinear')  
                             .toFloat()  
                             .clip(Ind);  

    Export.image.toDrive({
      image: selectedBands,
      description: collectionName + '_VIIRS_India_' + year, 
      scale: 1000,
      region: Ind,
      maxPixels: 1e13,
      fileFormat: 'GeoTIFF'
    });

    print('Exporting:', collectionName + '_VIIRS_India_' + year);
  }
};

exportImages(v21, 'V21');
exportImages(v22, 'V22');
