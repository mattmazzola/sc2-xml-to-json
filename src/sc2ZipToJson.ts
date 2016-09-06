import * as azure from "azure-storage";
import * as moment from "moment";
import * as util from './util';
import { zipToXml } from './sc2zipToXml';
import { xmlToJson } from './sc2xmlToJson';

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
    return zipToXml(zipFilePath, zipExtractPath);
  })
  .then(unitsXml => {
    const now = moment();
    const outputBlobName = `${now.format("YYYY-MM-DD-hh-mm-ss")}.xml`;
    return util.saveBlob(secureBlobService, "balancedataxml", outputBlobName, outputBlobName)
      .then(() => unitsXml);
  })
  .then(unitsXml => {
    return xmlToJson(unitsXml);
  })
  .then(groupedUnits => {
    const blobString = JSON.stringify(groupedUnits);
    const now = moment();
    const outputBlobName = `${now.format("YYYY-MM-DD-hh-mm-ss")}.json`;

    return Promise.all([
        util.writeFileAsync(outputBlobName, blobString),
        util.saveBlob(secureBlobService, outputContainerName, outputBlobName, blobString)
    ]);
  })
  .then(() => {
      process.exit(1);
  })
  .catch(error => {
    throw error;
  });
