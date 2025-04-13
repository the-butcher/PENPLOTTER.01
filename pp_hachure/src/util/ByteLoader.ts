/**
 * utility type for loading an array of bytes from a given url
 *
 * @author h.fleischer
 * @since 21.07.2019
 */
export class ByteLoader {

    /**
     * load from the given url and return a promise resolving to an instance of Uint8Array
     * @param url
     */
    async load(url: string): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.responseType = 'arraybuffer';
            xhr.open('GET', url);
            xhr.onload = function () {
                const responseType = xhr.getResponseHeader("Content-Type");
                if (xhr.getResponseHeader("Content-Type") === 'image/png') {
                    if (this.status >= 200 && this.status < 300) {
                        resolve(new Uint8Array(xhr.response));
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