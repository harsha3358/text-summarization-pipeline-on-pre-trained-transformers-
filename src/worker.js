import { pipeline, env, cos_sim } from '@xenova/transformers';

// Disable local models to force downloading from Hugging Face Hub.
env.allowLocalModels = false;
env.useBrowserCache = true;

class PipelineSingleton {
  static abstractivePipeline = null;
  static extractivePipeline = null;

  static async getAbstractive(progress_callback = null) {
    if (this.abstractivePipeline === null) {
      this.abstractivePipeline = pipeline('summarization', 'Xenova/distilbart-cnn-6-6', { progress_callback });
    }
    return this.abstractivePipeline;
  }

  static async getExtractive(progress_callback = null) {
    if (this.extractivePipeline === null) {
      // Use a feature extraction model to get embeddings for extractive summarization
      this.extractivePipeline = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { progress_callback });
    }
    return this.extractivePipeline;
  }
}

// Helper to split text into sentences simply
function splitIntoSentences(text) {
  return text.match(/[^.!?]+[.!?]+/g) || [text];
}

self.addEventListener('message', async (event) => {
  const { text, mode } = event.data;

  try {
    if (mode === 'abstractive') {
      const summarizer = await PipelineSingleton.getAbstractive((x) => {
        self.postMessage({ status: 'progress', ...x });
      });
      self.postMessage({ status: 'ready' });

      const result = await summarizer(text, {
        max_new_tokens: 150,
        min_length: 30,
      });

      self.postMessage({
        status: 'complete',
        output: result[0].summary_text,
      });

    } else if (mode === 'extractive') {
      const extractor = await PipelineSingleton.getExtractive((x) => {
        self.postMessage({ status: 'progress', ...x });
      });
      self.postMessage({ status: 'ready' });

      // 1. Split text into sentences
      let sentences = splitIntoSentences(text).map(s => s.trim()).filter(s => s.length > 10);
      if (sentences.length === 0) throw new Error("Text is too short or invalid.");

      // 2. Get embedding of the full document
      const docOutput = await extractor(text, { pooling: 'mean', normalize: true });
      const docEmbedding = docOutput.data;

      // 3. Get embeddings of each sentence and calculate cosine similarity
      const scoredSentences = [];
      for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i];
        const sentenceOutput = await extractor(sentence, { pooling: 'mean', normalize: true });
        const sentenceEmbedding = sentenceOutput.data;
        
        // Calculate similarity to the whole document
        const similarity = cos_sim(docEmbedding, sentenceEmbedding);
        scoredSentences.push({ sentence, similarity, index: i });
      }

      // 4. Pick top N sentences (e.g., top 30% or max 3 sentences)
      const numSentencesToPick = Math.max(1, Math.min(3, Math.ceil(sentences.length * 0.3)));
      scoredSentences.sort((a, b) => b.similarity - a.similarity);
      
      const topSentences = scoredSentences.slice(0, numSentencesToPick);
      // Sort back to original order
      topSentences.sort((a, b) => a.index - b.index);

      const summaryText = topSentences.map(s => s.sentence).join(' ');

      self.postMessage({
        status: 'complete',
        output: summaryText,
      });
    }

  } catch (error) {
    self.postMessage({
      status: 'error',
      error: error.message,
    });
  }
});
