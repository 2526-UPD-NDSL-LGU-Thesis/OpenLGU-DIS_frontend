

export enum Roles {
    RESIDENT,
    ADMIN,
    SUPER,
}

export interface User {
    username: string
    password: string
    roles: Roles
}