import transformLatLong from "./transformLatLongFn";

export default (lat, long) => {
  let pointLatLong = transformLatLong([lat, long]);
  let featurePoint = new ol.Feature(new ol.geom.Point(pointLatLong));
  //var source = new ol.source.Vector({ features: [iconFeature, iconFeature2] });
  /*var marker = new custom.style.MarkerStyle(
    "https://openlayers.org/en/v4.0.1/examples/data/icon.png"
  );*/
  return featurePoint;
};