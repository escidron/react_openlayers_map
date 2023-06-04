import { transform } from "ol/proj";

export default latlongArr => {
  let longlatArr = [latlongArr[1], latlongArr[0]];
  return transform(longlatArr, "EPSG:4326", "EPSG:3857");
};