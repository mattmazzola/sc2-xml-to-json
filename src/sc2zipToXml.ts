import * as AdmZip from "adm-zip";
import * as util from './util';
import * as path from 'path';

export function zipToXml(zipFilePath: string, zipExtractPath: string) {
  console.log(`Extracting ${zipFilePath} to directory: ${zipExtractPath}`);
  const zip = new AdmZip(zipFilePath);
  zip.extractAllTo(zipExtractPath, true);

  console.log(`Reading files from extraction directory: ${zipExtractPath}`);

  return util.readDir(zipExtractPath)
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
    });
}
