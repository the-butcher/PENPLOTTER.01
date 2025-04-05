import { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";

export class GeoJsonLoader {

    /**
     * load from the given url and return a promise resolving to a FeatureCollection
     * @param url
     */
    async load<G extends Geometry, P extends GeoJsonProperties>(url: string): Promise<FeatureCollection<G, P>> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.responseType = 'json';
            xhr.open('GET', url);
            xhr.onload = function () {
                const responseType = xhr.getResponseHeader("Content-Type");
                if (xhr.getResponseHeader("Content-Type") === 'application/geo+json') {
                    if (this.status >= 200 && this.status < 300) {
                        resolve(xhr.response);
                    } else {
                        reject(`invalid status code ${xhr.status}`);
                    }
                } else {
                    reject(`invalid response type ${responseType}`);
                }
            };
            xhr.onerror = function () {
                reject(`error ${xhr.status}`);
            };
            xhr.send();
        });
    }

}