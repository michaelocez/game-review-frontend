export type Game = {
    gameId: number;
    title: string;
    genreId: number;
    creationDate: string;
    creatorId: number;
    creatorFirstName: string;
    creatorLastName: string;
    price: number;
    rating: number;
    platformIds: number[];
}

export type GameFull = Game & {
    description: string;
    numberOfOwners: number;
    numberOfWishlists: number;
}

type Review = {
    reviewerId: number,
    rating: number,
    review: string,
    reviewerFirstName: string,
    reviewerLastName: string,
    timestamp: string
}

export type Genre = {
    genreId: number;
    name: string;
}

export type Platform = {
    platformId: number;
    name: string;
}

