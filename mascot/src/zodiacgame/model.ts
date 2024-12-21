export interface ZodiacCard {
    id: string;
    name: string;
    multiply: number;
    imageUrl: string;
    counter?: number;
    lastUpdate?: number;
}

export interface User {
    facebookUserId: string;
    name?: string;
    profileImageLink?: string;
    noGuessToday?: number;
    totalIcoin?: number;
}