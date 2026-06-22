export interface V4Options {
  disableEntropyCache?: boolean;
}

export function v4(options?: V4Options): string;
export function v4<TBuf extends Uint8Array = Uint8Array>(
  options: V4Options | undefined,
  buffer: TBuf,
  offset?: number
): TBuf;

declare const uuid: {
  v4: typeof v4;
};

export default uuid;
