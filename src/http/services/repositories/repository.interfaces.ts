
/** Type of repository */
export enum EngineRepositoryType {
    /** Repository is a collection of Driver logic */
    Driver = 0,
    /** Repository is a collection of interfaces */
    Interface = 1
}

export interface EngineRepositoryCommitQuery {
    /** URL encoded name of the driver being requested */
    driver: string;
}

export interface EngineRepositoryDetailsQuery {
    /** URL encoded name of the driver being requested */
    driver: string;
    /** Hash of the commit being requested for the driver */
    commit: string;
}

/** Metadata for a repository commit */
export interface EngineRepositoryCommit {
    /** Hash associated with the commit */
    commit: string;
    /** UTC epoch in seconds of the time the commit was made */
    date: number;
    /** Author of the commit */
    author: string;
    /** Commit subject line */
    subject: string;
}
