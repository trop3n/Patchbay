declare module 'net-snmp' {
  export interface SessionOptions {
    port?: number
    retries?: number
    timeout?: number
    transport?: string
    trapPort?: number
    version?: number
    backwardsGetNexts?: boolean
    idBitsSize?: number
    context?: string
    engineerID?: string[]
    parseCapsErrors?: boolean
  }

  export interface Varbind {
    oid: string
    type: number
    value: string | number | Buffer
    receivedOid?: string
  }

  export interface Session {
    get(
      oids: string[],
      callback: (error: Error | null, varbinds: Varbind[] | null) => void
    ): void
    get(
      oids: string[],
      feedCallback: (error: Error | null, varbinds: Varbind[] | null) => void,
      doneCallback: (error: Error | null) => void
    ): void
    set(
      varbinds: Array<{ oid: string; value: string | number; type: number }>,
      callback: (error: Error | null, varbinds: Varbind[] | null) => void
    ): void
    getNext(
      oids: string[],
      callback: (error: Error | null, varbinds: Varbind[] | null) => void
    ): void
    getBulk(
      oids: string[],
      options: { nonRepeaters?: number; maxRepetitions?: number },
      callback: (error: Error | null, varbinds: Varbind[] | null) => void
    ): void
    walk(
      oid: string,
      maxRepetitions: number,
      feedCallback: (varbind: Varbind) => boolean | void,
      doneCallback?: (error: Error | null) => void
    ): void
    subtree(
      oid: string,
      maxRepetitions: number,
      feedCallback: (varbind: Varbind) => boolean | void,
      doneCallback?: (error: Error | null) => void
    ): void
    close(): void
  }

  export function createSession(
    target: string,
    community: string,
    options?: SessionOptions
  ): Session

  export const Version1: number
  export const Version2c: number
  export const Version3: number

  export function isVarbindError(varbind: Varbind): boolean
  export function varbindError(varbind: Varbind): Error
}
