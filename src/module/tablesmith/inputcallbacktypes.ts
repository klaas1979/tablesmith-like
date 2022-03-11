export type InputTextCallback = (prompt: string, defaultValue: string) => Promise<string>;
export type InputListCallback = (defaultValue: number, prompt: string, options: string[]) => Promise<number>;
export type MsgCallback = (prompt: string) => Promise<void>;
export type StatusCallback = (status: string) => Promise<void>;
