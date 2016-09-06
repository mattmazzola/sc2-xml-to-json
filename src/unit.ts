import * as _ from "lodash";

export interface IEntity {
    id: number;
}

export interface IParsedEntity {
    id: string;
}

export interface IUnitReference extends IEntity {
    name: string;
}

export interface IParsedUnitReference extends IParsedEntity {
    name: string;
}

export interface IParsedUnit extends IParsedEntity {
    meta: IParsedMeta;
    life: IParsedHealth;
    armor: IParsedHealth;
    shields: IParsedHealth;
    shieldArmor: IParsedHealth;
    requires: IParsedRequires;
    cost: IParsedCost;
    movement: IParsedMovement;
    score: IParsedScore;
    misc: IParsedMisc;
    producer: IParsedUnitReference;
    attributes: IParsedAttributes;
    strengths: IParsedStrengths;
    weaknesses: IParsedWeaknesses;
    weapons: IParsedWeapons;
    abilities: IParsedAbilities;
    builds: IParsedWeaknesses;
    trains: IParsedWeaknesses;
    upgrades: IParsedUpgrades;
    researches: IParsedBuildingUpgrades;
}

export interface IUnit extends IEntity {
    meta: IMeta;
    life: IHealth;
    armor: IHealth;
    shieldArmor: IHealth;
    requires: IUnitReference[];
    cost: ICost;
    movement: IMovement;
    score: IScore;
    misc: IMisc;
    producer: IUnitReference;
    attributes: IAttribute[];
    strengths: IUnitReference[];
    weaknesses: IUnitReference[];
    weapons: IWeapon[];
    abilities: IAbility[];
    builds: IUnit[];
    trains: IUnit[];
    upgrades: IUpgrade[];
    researches: IBuildingUpgrade[];
}

export function convertUnit(parsedUnit: IParsedUnit): IUnit {
    const id = parsedUnit.meta && parseInt(parsedUnit.meta.name);
    const meta = parsedUnit.meta && convertMeta(parsedUnit.meta);
    meta.name = parsedUnit.id;
    
    let requires = [];
    if (parsedUnit.requires) {
        if (parsedUnit.requires.unit) {
            requires = requires.concat(convertOneOrMore(parsedUnit.requires.unit).map(convertUnitReference));
        }
        if (parsedUnit.requires.upgrade) {
            requires = requires.concat(convertOneOrMore(parsedUnit.requires.upgrade).map(convertUnitReference));
        }
    }

    return _.assign<IUnit>(parsedUnit, {
        id,
        meta,
        life: parsedUnit.life && convertHealth(parsedUnit.life),
        shields: parsedUnit.shields && convertHealth(parsedUnit.shields),
        armor: parsedUnit.armor && convertHealth(parsedUnit.armor),
        shieldArmor: parsedUnit.shieldArmor && convertHealth(parsedUnit.shieldArmor),
        cost: parsedUnit.cost && convertCost(parsedUnit.cost),
        movement: parsedUnit.movement && convertMovement(parsedUnit.movement),
        score: parsedUnit.score && convertScore(parsedUnit.score),
        misc: parsedUnit.misc && convertMisc(parsedUnit.misc),
        producer: parsedUnit.producer && convertUnitReference(parsedUnit.producer),
        attributes: parsedUnit.attributes && convertOneOrMore(parsedUnit.attributes.attribute),
        requires,
        strengths: parsedUnit.strengths && convertOneOrMore(parsedUnit.strengths.unit).map(convertUnitReference),
        weaknesses: parsedUnit.weaknesses && convertOneOrMore(parsedUnit.weaknesses.unit).map(convertUnitReference),
        weapons: parsedUnit.weapons && convertOneOrMore(parsedUnit.weapons.weapon).map(convertWeapon),
        abilities: parsedUnit.abilities && convertOneOrMore(parsedUnit.abilities.ability),
        // builds: convert,
        // trains: convert,
        upgrades: parsedUnit.upgrades && convertOneOrMore(parsedUnit.upgrades.upgrade).map(convertUpgrade),
        researches: parsedUnit.researches && convertOneOrMore(parsedUnit.researches.upgrade).map(convertBuildingUpgrade)
    });
}

export const RaceMap = {
    "Zerg": "zerg",
    "Prot": "protoss",
    "Terr": "terran",
    "Neut": "neutral"
}

export interface IParsedMeta {
    name: string;
    icon: string;
    race: string;
    hotkey: string;
    source: string;
    index: string;
    tooltip: string;
}

export interface IMeta {
    name: string;
    icon: string;
    race: string;
    hotkey: number;
    source: string;
    index: number;
    tooltip: number;
}

export function convertMeta(parsedMeta: IParsedMeta): IMeta {
    return _.assign<IMeta>(parsedMeta, {
        race: RaceMap[parsedMeta.race],
        hotkey: parsedMeta.hotkey && parseInt(parsedMeta.hotkey),
        index: parsedMeta.index && parseInt(parsedMeta.index),
        tooltip: parsedMeta.tooltip && parseInt(parsedMeta.tooltip)
    });
}

export interface IParsedHealth {
    start: string;
    max: string;
    regenRate: string;
    delay: string;
}

export interface IHealth {
    start: number;
    max: number;
    regenRate: number;
    delay: number;
}

export function convertHealth(parsedHealth: IParsedHealth): IHealth {
    return _.assign<IHealth>(parsedHealth, {
        start: parsedHealth.start && parseInt(parsedHealth.start),
        max: parsedHealth.max && parseInt(parsedHealth.max),
        regenRate: parsedHealth.regenRate && parseInt(parsedHealth.regenRate),
        delay: parsedHealth.delay && parseInt(parsedHealth.delay),
    });
}

export interface IParsedCost {
    minerals: string;
    vespene: string;
    time: string;
    supply: string;
}

export interface ICost {
    minerals: number;
    vespene: number;
    time: number;
    supply: number;
}

export function convertCost(parsedCost: IParsedCost): ICost {
    return _.assign<ICost>(parsedCost, {
        minerals: parsedCost.minerals && parseInt(parsedCost.minerals),
        vespene: parsedCost.vespene && parseInt(parsedCost.vespene),
        time: parsedCost.time && parseInt(parsedCost.time),
        supply: parsedCost.supply && parseInt(parsedCost.supply)
    });
}

export interface IParsedMovement {
    speed: string;
    acceleration: string;
    deceleration: string;
    turnRate: string;
}

export interface IMovement {
    speed: number;
    acceleration: number;
    deceleration: number;
    turnRate: number; 
}

export function convertMovement(parsedMovement: IParsedMovement): IMovement {
    return _.assign<IMovement>({
        speed: parsedMovement.speed && parseInt(parsedMovement.speed),
        acceleration: parsedMovement.acceleration && parseInt(parsedMovement.acceleration),
        deceleration: parsedMovement.deceleration && parseInt(parsedMovement.deceleration),
        turnRate: parsedMovement.turnRate && parseInt(parsedMovement.turnRate)
    });
}

export interface IParsedScore {
    build: string;
    kill: string;
}

export interface IScore {
    build: number;
    kill: number;
}

export function convertScore(parsedScore: IParsedScore): IScore {
    return _.assign<IScore>(parsedScore, {
        build: parsedScore.build && parseInt(parsedScore.build),
        kill: parsedScore.kill && parseInt(parsedScore.kill)
    });
}

export interface IParsedMisc {
    radius: string;
    cargoSize: string;
    footprint: string;
    sightRadius: string;
    supply: string;
    speed: number;
    targets: string;
}

export interface IMisc {
    radius: number;
    cargoSize: number;
    footprint: string;
    sightRadius: number;
    supply: number;
    speed: number;
    targets: string;
}

export function convertMisc(parsedMisc: IParsedMisc): IMisc {
    return _.assign<IMisc>({
        radius: parsedMisc.radius && parseInt(parsedMisc.radius),
        cargoSize: parsedMisc.cargoSize && parseInt(parsedMisc.cargoSize),
        sightRadius: parsedMisc.sightRadius && parseInt(parsedMisc.sightRadius),
        supply: parsedMisc.supply && parseInt(parsedMisc.supply)
    });
}

export interface IParsedAttributes {
    attribute: IAttribute | IAttribute[];
}

export interface IAttribute {
    type: string;
}

export interface IParsedStrengths {
    unit: IParsedUnitReference[];
}

export interface IParsedRequires {
    unit?: IParsedUnitReference | IParsedUnitReference[];
    upgrade?: IParsedUnitReference | IParsedUnitReference[];
}

export function convertUnitReference(parsedUnitReference: IParsedUnitReference): IUnitReference {
    return {
        id: parseInt(parsedUnitReference.name),
        name: parsedUnitReference.id
    };
}

export function convertOneOrMore<T>(parsedInput: T | T[]): T[] {
    return Array.isArray(parsedInput) ? parsedInput : [parsedInput];
}

export interface IParsedWeaknesses {
    unit: IParsedUnitReference[];
}

export interface IParsedWeapons {
    weapon: IParsedWeapon[];
}

export interface IParsedWeapon {
    id: string;
    index: string;
    meta: IParsedMeta;
    misc: IParsedWeaponMisc;
    effect: IParsedEffect;
}


export interface IWeapon {
    id: number;
    index: number;
    meta: IMeta;
    misc: IWeaponMisc;
    effect: IEffect;
}

export function convertWeapon(parsedWeapon: IParsedWeapon): IWeapon {
    const id = parsedWeapon.meta && parseInt(parsedWeapon.meta.name);
    const meta = parsedWeapon.meta && convertMeta(parsedWeapon.meta);
    meta.name = parsedWeapon.id;

    return {
        id,
        index: parsedWeapon.index && parseInt(parsedWeapon.index),
        meta,
        misc: parsedWeapon.misc && convertWeaponMisc(parsedWeapon.misc),
        effect: parsedWeapon.effect && convertEffect(parsedWeapon.effect)
    };
}


export interface IParsedWeaponMisc {
    range: string;
    speed: string;
    targets: string;
}

export interface IWeaponMisc {
    range: number;
    speed: number;
    targets: string;
}

export function convertWeaponMisc(parsedWeaponMisc: IParsedWeaponMisc): IWeaponMisc {
    return {
        range: parseInt(parsedWeaponMisc.range),
        speed: parseFloat(parsedWeaponMisc.speed),
        targets: parsedWeaponMisc.targets
    };
}

export interface IParsedEffect {
    id: string;
    index: string;
    radius: string;
    damage: string;
    max: string;
    death: string;
    kind: string;
    bonus: IParsedBonus;
}

export interface IEffect {
    id: string;
    index: number;
    radius: number;
    max: number;
    death: string;
    kind: string;
    bonus: IBonus;
}

export function convertEffect(parsedEffect: IParsedEffect): IEffect {
    return {
        id: parsedEffect.id,
        index: parsedEffect.index && parseInt(parsedEffect.index),
        radius: parsedEffect.radius && parseFloat(parsedEffect.radius),
        max: parsedEffect.max && parseInt(parsedEffect.max),
        death: parsedEffect.death,
        kind: parsedEffect.kind,
        bonus: parsedEffect.bonus && convertBonus(parsedEffect.bonus)
    };
}

export interface IParsedBonus {
    damage: string;
    max: string;
    type: string;
}

export interface IBonus {
    damage: number;
    max: number;
    type: string;
}

export function convertBonus(parsedBonus: IParsedBonus): IBonus {
    return {
        damage: parsedBonus.damage && parseInt(parsedBonus.damage),
        max: parsedBonus.max && parseInt(parsedBonus.max),
        type: parsedBonus.type
    };
}

export interface IParsedAbilities {
    ability: IAbility[];
}

export interface IAbility {

}

export interface IParsedUpgrades {
    upgrade: IParsedUpgrade[];
}

export interface IParsedUpgrade {
    id: string;
    index: string;
    level: IParsedUpgradeLevel | IParsedUpgradeLevel[]
}

export interface IParsedBuildingUpgrades {
    upgrade: IParsedBuildingUpgrade[];
}

export interface IUpgrade {
    id: string;
    index: number;
    levels: IUpgradeLevel[];
}

export function convertUpgrade(parsedUpgrade: IParsedUpgrade): IUpgrade {
    return {
        id: parsedUpgrade.id,
        index: parseInt(parsedUpgrade.index),
        levels: parsedUpgrade.level && convertOneOrMore(parsedUpgrade.level).map(convertUpgradeLevel)
    };
}

export interface IParsedUpgradeLevel {
    id: string;
    index: string;
    requires: IParsedLevelRequires;
    meta: IParsedMeta;
    cost: IParsedCost;
}
export interface IUpgradeLevel {
    id: string;
    index: number;
    requires: ILevelRequires;
    meta: IMeta;
    cost: ICost;
}

export function convertUpgradeLevel(parsedUpgradeLevel: IParsedUpgradeLevel): IUpgradeLevel {
    const id = parsedUpgradeLevel.meta.name;
    const meta = convertMeta(parsedUpgradeLevel.meta);
    meta.name = parsedUpgradeLevel.id;

    return {
        id,
        index: parseInt(parsedUpgradeLevel.index),
        requires: parsedUpgradeLevel.requires && convertLevelRequires(parsedUpgradeLevel.requires),
        meta,
        cost: convertCost(parsedUpgradeLevel.cost)
    };
}

export interface IParsedLevelRequires {
    upgrade: IParsedUnitReference;
    unit: IParsedUnitReference;
}

export interface ILevelRequires {
    upgrade: IUnitReference;
    unit: IUnitReference;
}

export function convertLevelRequires(parsedLevelRequires: IParsedLevelRequires): ILevelRequires {
    return {
        upgrade: parsedLevelRequires.upgrade && convertUnitReference(parsedLevelRequires.upgrade),
        unit: parsedLevelRequires.unit && convertUnitReference(parsedLevelRequires.unit)
    };
}

export interface IParsedBuildingUpgrade {
    id: string;
    index: string;
    ability: string;
    meta: IParsedMeta;
    cost: IParsedCost;
}

export interface IBuildingUpgrade {
    id: number;
    index: number;
    ability: number;
    meta: IMeta;
    cost: ICost;
}

export function convertBuildingUpgrade(parsedBuildingUpgrade: IParsedBuildingUpgrade): IBuildingUpgrade {
    const id = parseInt(parsedBuildingUpgrade.meta.name);
    const meta = convertMeta(parsedBuildingUpgrade.meta);
    meta.name = parsedBuildingUpgrade.id;
    
    return {
        id,
        ability: parseInt(parsedBuildingUpgrade.ability),
        index: parseInt(parsedBuildingUpgrade.index),
        meta,
        cost: convertCost(parsedBuildingUpgrade.cost)
    };
}