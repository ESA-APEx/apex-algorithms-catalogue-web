import React, { useEffect, useRef, useState } from "react";
import proj4 from "proj4";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { register } from "ol/proj/proj4";
import OSM from "ol/source/OSM";
import { Feature } from "ol";
import { Polygon } from "ol/geom";
import { FullScreen, Zoom } from "ol/control";
import GeoJSON from "ol/format/GeoJSON";
import { fromLonLat, transformExtent } from "ol/proj";
import { Fill, Stroke, Style, Circle as CircleStyle } from "ol/style";
import { isEmpty } from "ol/extent";
import "ol/ol.css";
import { fromExtent } from "ol/geom/Polygon";

proj4.defs("EPSG:32631", "+proj=utm +zone=31 +datum=WGS84 +units=m +no_defs");

register(proj4);

interface MapViewerProps {
  geometry: string;
  width?: string;
  height?: string;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  geometry,
  width = "100%",
  height = "100%",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const vectorLayer = useRef<VectorLayer<VectorSource> | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!mapRef.current) return;

    // Create vector source and layer for GeoJSON/bbox features
    const vectorSource = new VectorSource();
    vectorLayer.current = new VectorLayer({
      source: vectorSource,
      style: new Style({
        fill: new Fill({
          color: "rgba(255, 0, 0, 0.3)",
        }),
        stroke: new Stroke({
          color: "red",
          width: 2,
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: "red",
          }),
        }),
      }),
    });

    // Initialize map
    map.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer.current,
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
      controls: [new FullScreen(), new Zoom()],
    });

    return () => {
      if (map.current) {
        map.current.setTarget(undefined);
      }
    };
  }, []);

  useEffect(() => {
    if (!geometry.trim() || !vectorLayer.current) return;

    const vectorSource = vectorLayer.current.getSource()!;
    vectorSource.clear();
    setError("");

    try {
      const parsedData = JSON.parse(geometry);

      if (
        parsedData.type === "FeatureCollection" ||
        parsedData.type === "Feature" ||
        [
          "Point",
          "LineString",
          "Polygon",
          "MultiPoint",
          "MultiLineString",
          "MultiPolygon",
        ].includes(parsedData.type)
      ) {
        const format = new GeoJSON();
        const features = format.readFeatures(parsedData, {
          featureProjection: "EPSG:3857",
        });

        vectorSource.addFeatures(features);

        // Fit view to features
        if (features.length > 0) {
          const extent = vectorSource.getExtent();
          if (extent && !isEmpty(extent) && map.current) {
            map.current.getView().fit(extent, {
              padding: [20, 20, 20, 20],
              maxZoom: 15,
            });
          }
        }
      } else if (
        parsedData.hasOwnProperty("west") &&
        parsedData.hasOwnProperty("south") &&
        parsedData.hasOwnProperty("east") &&
        parsedData.hasOwnProperty("north")
      ) {
        const { west, south, east, north } = parsedData;

        // Validate bbox
        if (west >= east || south >= north) {
          throw new Error(
            "Invalid bbox: min values must be less than max values",
          );
        }

        const polygon = new Polygon([
          [
            [west, south],
            [east, south],
            [east, north],
            [west, north],
            [west, south],
          ],
        ]);

        polygon.transform(
          parsedData.crs || parsedData.srs || "EPSG:4326",
          "EPSG:3857",
        );

        const feature = new Feature({
          geometry: polygon,
        });

        vectorSource.addFeature(feature);

        // Fit view to bbox
        const extent = polygon.getExtent();
        map.current!.getView().fit(extent, {
          padding: [20, 20, 20, 20],
        });
      } else {
        throw new Error(
          "Input must be valid GeoJSON or bbox format { west, south, east, north }",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  }, [geometry]);

  return (
    <>
      <div ref={mapRef} style={{ width, height }} />
      {error && (
        <div
          style={{
            marginTop: "10px",
            padding: "10px",
            backgroundColor: "#ffe6e6",
            border: "1px solid #ff9999",
            borderRadius: "4px",
            color: "#d63031",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}
    </>
  );
};
