import * as azure from "azure-storage";
import * as fs from "fs";
import * as path from "path";
import * as AdmZip from "adm-zip";
import * as xml2js from "xml2js";
import * as unit from "./unit";
import * as moment from "moment";
import * as _ from "lodash";
import * as util from './util';

const storageAccount = process.env.AZURE_STORAGE_ACCOUNT;
const storageAccountUrl = process.env.AZURE_STORAGE_ACCOUNT_URL;
const storageAccessKey = process.env.AZURE_STORAGE_ACCESS_KEY;
const containerName = process.env.AZURE_BLOB_CONTAINER;
const outputContainerName = process.env.AZURE_BLOB_OUTPUT_CONTAINER;
const outputQueueName = process.env.AZURE_OUTPUT_QUEUE;
const blobName = "2016-08-21.zip";
const tempZipFileName = "balancedata.zip";
const zipExtractPath = "extract";

const anonymousBlobService: azure.BlobService = azure.createBlobServiceAnonymous(storageAccountUrl);
const secureBlobService = azure.createBlobService(storageAccount, storageAccessKey);

console.log(`Created blob service to: ${storageAccountUrl}`);
console.log(`Attempting to download blob from container: ${containerName} with name: ${blobName}`);

const unitsPromise = util.writeBlobToFile(anonymousBlobService, containerName, blobName, tempZipFileName)
  .then(zipFilePath => {
    console.log(`Saved blob file to: ${tempZipFileName}`);

    console.log(`Extracting ${tempZipFileName} to directory: ${zipExtractPath}`);
    const zip = new AdmZip(tempZipFileName);
    zip.extractAllTo(zipExtractPath, true);

    console.log(`Reading files from extraction directory: ${zipExtractPath}`);

    return util.readDir(zipExtractPath);
  })
  .then(filenames => {
      const filteredFilenames = filenames
        .filter(x => x.indexOf('.xml') !== -1)
        ;

      const unitFilePromises = filteredFilenames
        .map(filename => {
          const filepath = path.join(zipExtractPath, filename);
          return util.readFileAsync(filepath);
        });

      return Promise.all(unitFilePromises);
  })
  .then(unitString => {
    return `<units>${unitString}</units>`;
  })
  .then(unitsXml => {
    const now = moment();
    const outputBlobName = `${now.format("YYYY-MM-DD-hh-mm-ss")}.xml`;
    return util.saveBlob(secureBlobService, "balancedataxml", outputBlobName, outputBlobName)
      .then(() => unitsXml);
  })
  .then(unitsXml => {
    const xmlParserOptions: xml2js.Options = {
      explicitRoot: false,
      mergeAttrs: true,
      emptyTag: null,
      explicitArray: false
    };

    return util.xml2jsonAsync(unitsXml, xmlParserOptions);
  })
  .then((parsedUnits: { unit: unit.IParsedUnit[] }) => {
    const units: unit.IUnit[] = parsedUnits.unit.map(parsedUnit => unit.convertUnit(parsedUnit));
    const nonNeutralUnits = units.filter(unit => unit.meta.race !== "neutral");
    const groupedUnits = _.groupBy(nonNeutralUnits, unit => {
      if (unit.meta.icon && unit.meta.icon.indexOf('btn-building') !== -1) {
        return 'buildings';
      }
      else if (unit.id.indexOf('Weapon') !== -1) {
        return 'weapons';
      }

      return 'units';
    });

    console.log(`Converted ${units.length} total files.`);
    console.log(`Found ${nonNeutralUnits.length} non-neutral objects`);
    console.log(`Found ${groupedUnits["units"].length} units, ${groupedUnits["weapons"].length} weapons, and ${groupedUnits["buildings"].length} buildings.`);

    const blobString = JSON.stringify(groupedUnits);
    const now = moment();
    const outputBlobName = `${now.format("YYYY-MM-DD-hh-mm-ss")}.json`;

    return util.saveBlob(secureBlobService, outputContainerName, outputBlobName, blobString);
  })
  .catch(error => {
    throw error;
  });




