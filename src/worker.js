import { pipeline, env } from '@xenova/transformers';

// Disable local models to force downloading from Hugging Face Hub.
// This is required for client-side browser usage without a local backend.
env.allowLocalModels = false;

// Set caching to true so we don't redownload the model every time
env.useBrowserCache = true;

class PipelineSingleton {
  static task = 'summarization';
  static model = 'Xenova/distilbart-cnn-6-6';
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
  const { text } = event.data;

  // Retrieve the pipeline. When called for the first time,
  // this will load the pipeline and send progress events to the main thread.
  const summarizer = await PipelineSingleton.getInstance((x) => {
    // Send progress updates back to the main thread
    self.postMessage({ status: 'progress', ...x });
  });

  self.postMessage({ status: 'ready' });

  try {
    // Perform summarization
    const result = await summarizer(text, {
      max_new_tokens: 150,
      min_length: 30,
    });

    // Send the result back to the main thread
    self.postMessage({
      status: 'complete',
      output: result[0].summary_text,
    });
  } catch (error) {
    self.postMessage({
      status: 'error',
      error: error.message,
    });
  }
});
