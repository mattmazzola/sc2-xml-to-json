import * as azure from "azure-storage";
import * as fs from 'fs';
import * as xml2js from "xml2js";

export function readFileAsync(filePath: string) {
    return new Promise<string>((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (error, data) => {
            if (error) {
                return reject(error);
            }

            resolve(data);
        });
    });
}

export function readDir(path: string) {
    return new Promise<string[]>((resolve, reject) => {
        fs.readdir(path, (error, filenames) => {
            if (error) {
                reject(error);
            }

            resolve(filenames);
        });
    });
}

export function writeBlobToFile(blobService: azure.BlobService, containerName: string, blobName: string, filePath: string) {
    return new Promise<string>((resolve, reject) => {
        blobService.getBlobToStream(containerName, blobName, fs.createWriteStream(filePath), (error, result, response) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(filePath);
        });
    });
}


export function saveBlob(blobService: azure.BlobService, containerName: string, blobName: string, blobString: string) {
    return new Promise<any>((resolve, reject) => {
        blobService.createBlockBlobFromText(containerName, blobName, blobString, (error, result, response) => {
            if (error) {
                reject(error);
            }

            resolve(result);
        });
    });
}

export function xml2jsonAsync(xml: string, xmlParserOptions?: xml2js.Options) {
    return new Promise<any>((resolve, reject) => {
        const xmlParserOptions: xml2js.Options = {
            explicitRoot: false,
            mergeAttrs: true,
            emptyTag: null,
            explicitArray: false
        };

        xml2js.parseString(xml, xmlParserOptions, (error, json) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(json);
        });
    });
}
