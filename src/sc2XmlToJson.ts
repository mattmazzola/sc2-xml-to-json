import * as azure from "azure-storage";
import * as fs from "fs";
import * as path from "path";
import * as AdmZip from "adm-zip";
import * as xml2js from "xml2js";
import * as unit from "./unit";
import * as moment from "moment";
import * as _ from "lodash";

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
const queueService = azure.createQueueService(storageAccount, storageAccessKey);

console.log(`Created blob service to: ${storageAccountUrl}`);
console.log(`Attempting to download blob from container: ${containerName} with name: ${blobName}`);

const unitsPromise = new Promise<unit.IUnit[]>((resolve, reject) => {
  anonymousBlobService.getBlobToStream(containerName, blobName, fs.createWriteStream(tempZipFileName), (error, result, response) => {
    if (error){
      return reject(error);
    }

    console.log(`Downloaded blob file to: ${tempZipFileName}`);
    console.log(result);

    console.log(`Extracting ${tempZipFileName} to directory: ${zipExtractPath}`);
    const zip = new AdmZip(tempZipFileName);
    zip.extractAllTo(zipExtractPath, true);

    console.log(`Reading files from extraction directory: ${zipExtractPath}`);
    fs.readdir(zipExtractPath, (error, filenames) => {
      if (error) {
        return reject(error);
      }

      console.log(filenames);

      const filteredFilenames = filenames
        .filter(x => x.indexOf('.xml') !== -1)
        ;

      console.log(filteredFilenames);
      const unitPromises: Promise<unit.IUnit>[] = filteredFilenames
        .map(filename => {
          const filepath = path.join(zipExtractPath, filename);
          console.log(`Reading file: ${filepath}`);

          return new Promise((resolveFile, rejectFile) => {
            fs.readFile(filepath, 'utf8', (error, data) => {
              if (error) {
                return rejectFile(error);
              }

              console.log(`Converting ${filename} to JSON`);

              const xmlParserOptions: xml2js.Options = {
                explicitRoot: false,
                mergeAttrs: true,
                emptyTag: null,
                explicitArray: false
              };

              xml2js.parseString(data, xmlParserOptions, (error, data) => {
                const unitObject = unit.convertUnit(data);
                resolveFile(unitObject);
              });
            });
          });
        });

      resolve(Promise.all(unitPromises));
    });
  });
})
  .then(units => {
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
    secureBlobService.createBlockBlobFromText(outputContainerName, outputBlobName, blobString, (error, result, response) => {
      if (error) {
        throw error;
      }

      console.log(`Uploaded json to container: /${outputContainerName}/${outputBlobName}`);

      const message = {
        name: outputBlobName
      };

      queueService.createMessage(outputQueueName, new Buffer(JSON.stringify(message)).toString("base64"), (error, response) => {
        if (error) {
          throw error;
        }

        console.log(`Added message to queue indicating upload is complete.`);
        process.exit();
      });
    });
  })
  .catch(error => {
    throw error;
  });




