# AI Text Summarization Pipeline 🚀

Welcome to the **Gen Z & Gen Alpha Edition** of the AI Text Summarizer! 

This project is a highly scalable, zero-latency text summarization web application built specifically with a modern, light pastel, glassmorphic aesthetic.

## 🔗 Live Hosted Link
**Play with the live version here:** [https://harsha3358.github.io/text-summarization-pipeline-on-pre-trained-transformers-/](https://harsha3358.github.io/text-summarization-pipeline-on-pre-trained-transformers-/)

## ✨ Key Features & Architecture
We built this application using **Client-Side AI (Transformers.js)**. This means the AI runs entirely in the user's browser via Web Workers, offering:
- **Zero Latency:** No waiting for a backend server to respond.
- **Infinite Scale:** Can support 10,000+ employees simultaneously without any server crash.
- **100% Free:** Zero server compute costs because the models run on edge devices.

### 🧠 Dual Pre-Trained Transformer Pipelines
This application supports two distinct summarization modes, powered by Hugging Face models:

1. **Abstractive Summarization** (`Xenova/distilbart-cnn-6-6`)
   - The AI acts as a smart assistant, reading the text and rewriting it into a concise, original summary in its own words.

2. **Extractive Summarization** (`Xenova/all-MiniLM-L6-v2`)
   - The AI uses powerful semantic embeddings to mathematically find and extract the most important, exact sentences from your original text. 

## 🎨 UI/UX Design
The interface is tailored for Gen Z and Gen Alpha users:
- **Light Mode Glassmorphism:** Frosted glass panels over bright pastel gradients.
- **Smooth Animations:** Floating abstract blobs and hardware-accelerated transitions.
- **Micro-Interactions:** Modern typography (`Outfit` font), soft box shadows, and responsive loading bars.

## 🛠️ How to Run Locally

If you want to run this project on your local machine:

1. Clone the repository
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🚀 How to Deploy (GitHub Pages)

The project is already configured for easy, free hosting on GitHub Pages!
To manually push a new update to the live link, just run:
```bash
npm run deploy
```
*(This automatically builds the project and pushes the `dist` folder to your `gh-pages` branch).*