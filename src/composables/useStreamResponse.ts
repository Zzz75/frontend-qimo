import { ref } from 'vue';

export const useStreamResponse = () => {
  const streamText = ref('');

  const appendChunk = (chunk: string) => {
    if (!chunk) {
      return streamText.value;
    }
    streamText.value += chunk;
    return streamText.value;
  };

  const resetStream = () => {
    streamText.value = '';
    return streamText.value;
  };

  const finalizeStream = () => {
    const fullText = streamText.value;
    streamText.value = '';
    return fullText;
  };

  return {
    streamText,
    appendChunk,
    resetStream,
    finalizeStream
  };
};
