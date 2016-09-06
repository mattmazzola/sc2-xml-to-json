import * as xml2js from "xml2js";
import * as unit from "./unit";
import * as _ from "lodash";
import * as util from './util';

export function xmlToJson(unitsXml: string) {
  const xmlParserOptions: xml2js.Options = {
    explicitRoot: false,
    mergeAttrs: true,
    emptyTag: null,
    explicitArray: false
  };

  return util.xml2jsonAsync(unitsXml, xmlParserOptions)
    .then((parsedUnits: { unit: unit.IParsedUnit[] }) => {
      const units: unit.IUnit[] = parsedUnits.unit.map(parsedUnit => unit.convertUnit(parsedUnit));
      const nonNeutralUnits = units.filter(unit => unit.meta.race !== "neutral");
      const groupedUnits = _.groupBy(nonNeutralUnits, unit => {

        if (unit.meta.icon === "btn-missing-kaeo") {
          return "missingIcon";
        }
        else if ((Array.isArray(unit.attributes) && unit.attributes.some(attribute => attribute.type === "Structure"))
          || unit.meta.icon && unit.meta.icon.indexOf('btn-building') !== -1) {
          return 'buildings';
        }
        else if (unit.meta.name.indexOf('Weapon') !== -1) {
          return 'weapons';
        }

        return 'units';
      });

      console.log(`Converted ${units.length} total files.`);
      console.log(`Found ${nonNeutralUnits.length} non-neutral objects`);
      console.log(`Found ${groupedUnits["units"].length} units, ${groupedUnits["weapons"].length} weapons, and ${groupedUnits["buildings"].length} buildings.`);

      return groupedUnits;
    });
}