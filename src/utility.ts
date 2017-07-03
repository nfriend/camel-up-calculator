export class Utility {
    
    // from https://stackoverflow.com/a/21294925/1063392
    static getEnumNamesAndValues<T extends number>(e: any) {
        return Utility.getEnumNames(e).map(n => ({ name: n, value: e[n] as T }));
    }

    static getEnumNames(e: any) {
        return Utility.getObjValues(e).filter(v => typeof v === "string") as string[];
    }

    static getEnumValues<T extends number>(e: any) {
        return Utility.getObjValues(e).filter(v => typeof v === "number") as T[];
    }

    private static getObjValues(e: any): (number | string)[] {
        return Object.keys(e).map(k => e[k]);
    }
}