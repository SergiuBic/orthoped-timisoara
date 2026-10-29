export type ActionResult<T = undefined> = ({ ok: true } & (T extends undefined ? object : { data: T })) | { ok: false; error: string };

export const fail = (error: string): { ok: false; error: string } => ({ ok: false, error });
