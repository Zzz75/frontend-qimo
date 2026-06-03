export const useStreamResponse = () => {
  const appendChunk = (_chunk: string) => {};
  const finalizeStream = () => {};

  return {
    appendChunk,
    finalizeStream
  };
};
