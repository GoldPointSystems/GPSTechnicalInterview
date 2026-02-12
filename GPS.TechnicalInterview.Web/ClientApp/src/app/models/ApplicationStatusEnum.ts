export enum ApplicationStatusEnum {
    New = 0,
    Approved = 1,
    Funded = 2
}

export namespace ApplicationStatusEnum {
    export function getKeys(): [number,string][]
    {
        return Object.entries(ApplicationStatusEnum)
            .filter(k =>!isNaN(Number(k[0])))
            .map(k => {
                const key = Number(k[0]);
                return [key, ApplicationStatusEnum[key]];
            });
                
    }
}

