import { MapboxVectorLayer } from 'ol-mapbox-style';
import Map from "ol/Map";
import View from "ol/View";
import { createRef, useEffect } from "react";

/**
 * TODO :: simple map (maybe proprietary geojson display of austria and its provinces for orientation)
 * TODO :: tile grid display, so tiles can be picked for further processing
 *
 */
function OlMapComponent() {

    const mapRef = createRef<HTMLDivElement>();

    useEffect(() => {

        console.debug('✨ building map component');

        if (mapRef.current) {

            // const osmLayer = new TileLayer({
            //     preload: Infinity,
            //     source: new OSM(),
            // });
            const basemapAtVectorLayer = new MapboxVectorLayer({
                styleUrl: 'https://mapsneu.wien.gv.at/basemapvectorneu/root.json',
            });
            const basemapAtContourLayer = new MapboxVectorLayer({
                styleUrl: 'https://mapsneu.wien.gv.at/basemapv/bmapvhl/3857/resources/styles/root.json',
            });

            const map = new Map({
                target: mapRef.current,
                layers: [basemapAtVectorLayer, basemapAtContourLayer],
                view: new View({
                    center: [0, 0],
                    zoom: 0,
                }),
            })

            return () => map.setTarget(undefined)

        }

    }, []);

    return (
        <div
            ref={mapRef}
            style={{
                width: '100%',
                height: '100%'
            }}
        ></div>
    );
}

export default OlMapComponent
