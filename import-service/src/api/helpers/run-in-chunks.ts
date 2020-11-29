export const runInChunks = <T, R>(
  runner: (
    next: (data: T) => Promise<void>,
    complete: () => Promise<void>
  ) => R,
  chunkSize: number,
  callback: (chunk: T[]) => Promise<void>
): R => {
  let chunk: T[] = [];
  return runner(
    async (data) => {
      chunk.push(data);
      if (chunk.length >= chunkSize) {
        const cbResult = callback(chunk);
        chunk = [];
        await cbResult;
      }
    },
    async () => {
      if (chunk.length) {
        await callback(chunk);
      }
    }
  );
};
