import * as _ from "lodash";

export interface IEntity {
    id: string;
}

export interface IUnitReference extends IEntity {
    name: string;
}

export interface IParsedUnit extends IEntity {
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
    producer: IEntity;
    attributes: IParsedAttributes;
    strengths: IParsedStrengths;
    weaknesses: IParsedWeaknesses;
    weapons: IParsedWeapons;
    abilities: IParsedAbilities;
    builds: IParsedWeaknesses;
    trains: IParsedWeaknesses;
    upgrades: IParsedUpgrades;
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
    producer: IEntity;
    attributes: IAttribute[];
    strengths: IUnitReference[];
    weaknesses: IUnitReference[];
    weapons: IWeapon[];
    abilities: IAbility[];
    builds: IUnit[];
    trains: IUnit[];
    upgrades: IUpgrade[];
}

export function convertUnit(parsedUnit: IParsedUnit): IUnit {
    return _.assign<IUnit>(parsedUnit, {
        meta: parsedUnit.meta && convertMeta(parsedUnit.meta),
        life: parsedUnit.life && convertHealth(parsedUnit.life),
        shields: parsedUnit.shields && convertHealth(parsedUnit.shields),
        armor: parsedUnit.armor && convertHealth(parsedUnit.armor),
        shieldArmor: parsedUnit.shieldArmor && convertHealth(parsedUnit.shieldArmor),
        cost: parsedUnit.cost && convertCost(parsedUnit.cost),
        movement: parsedUnit.movement && convertMovement(parsedUnit.movement),
        score: parsedUnit.score && convertScore(parsedUnit.score),
        misc: parsedUnit.misc && convertMisc(parsedUnit.misc),
        attributes: parsedUnit.attributes && convertOneOrMore(parsedUnit.attributes.attribute),
        requires: parsedUnit.requires && convertOneOrMore(parsedUnit.requires.unit),
        strengths: parsedUnit.strengths && parsedUnit.strengths.unit,
        weaknesses: parsedUnit.weaknesses && parsedUnit.weaknesses.unit,
        weapons: parsedUnit.weapons && convertOneOrMore(parsedUnit.weapons.weapon),
        abilities: parsedUnit.abilities && convertOneOrMore(parsedUnit.abilities.ability),
        // builds: convert,
        // trains: convert,
        upgrades: parsedUnit.upgrades && convertOneOrMore(parsedUnit.upgrades.upgrade),
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
    unit: IUnitReference[];
}

export interface IParsedRequires {
    unit: IUnitReference | IUnitReference[];
}

export function convertOneOrMore<T>(parsedInput: T | T[]): T[] {
    return Array.isArray(parsedInput) ? parsedInput : [parsedInput];
}

export interface IParsedWeaknesses {
    unit: IUnitReference[];
}

export interface IParsedWeapons {
    weapon: IWeapon[];
}

export interface IWeapon {

}

export interface IParsedAbilities {
    ability: IAbility[];
}

export interface IAbility {

}

export interface IParsedUpgrades {
    upgrade: IUpgrade[];
}

export interface IUpgrade {
    
}