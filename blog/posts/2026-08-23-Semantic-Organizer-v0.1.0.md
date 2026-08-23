---
title: "Semantic Organizer v0.1.0: Bringing Local AI and Vectorless GraphRAG to Your Filesystem"
slug: "semantic-organizer-v0.1"
date: "2026-08-23"
tags: ["cli", "graph-rag", "local-ai", "open-source"]
excerpt: "We're releasing Semantic Organizer v0.1.0—a local AI CLI tool that organizes your chaotic folders into a deterministic semantic knowledge graph without touching the cloud."
draft: false
---

Over the past few weeks, we’ve been building **Semantic Organizer** — an open-source, privacy-first CLI tool designed to tame the chaos of the `~/Downloads` folder. Today, I'm thrilled to announce the release of v0.1.0. 

At its core, Semantic Organizer takes a folder of messy, unstructured documents (PDFs, Word files, text), uses local AI to understand them, and automatically organizes them into a semantic folder hierarchy. But along the way, the project evolved into something much more ambitious: a **Vectorless GraphRAG** engine built directly over your file system.

Here is a look at what we learned, the major technical challenges we overcame, and where the project is heading next.

![Semantic Organizer CLI](../assets/img/semantic-organizer-cli.jpg)

---

## 🛑 The Challenge: Escaping the Cloud & the Vector Trap

When we started, the architecture looked like a standard AI wrapper: send documents to an OpenAI API, get vector embeddings, dump them into a heavy graph database like Neo4j, and use semantic similarity to group things. 

But we quickly hit two walls:
1. **Privacy & Cost:** Users do not want to upload their sensitive tax returns, financial statements, or personal journals to a cloud API. It *must* run locally.
2. **The Vector Search Illusion:** Vector embeddings are great for "vibes" and semantic search, but they are terrible for deterministic file organization. If a document mentions "Toronto", it shouldn't just be *semantically close* to Toronto; it should be linked by a hard, relational edge.

### The Solution: Pure Graph, Pure Local

We tore out the cloud dependencies and the vector database entirely. 

- **Local Extraction:** We switched exclusively to **LM Studio** and **IBM Docling**, allowing everything to run locally and privately on Apple Silicon.
- **Lightweight Graph:** We dropped Neo4j in favor of a lightweight, pure **NetworkX** graph stored as a simple JSON file (`.semantic_graph.json`). 

By treating every file, tag, and entity as a node, we created a deterministic Knowledge Graph. When you ask the system a question via `semantic-organizer chat`, it doesn't do a fuzzy vector lookup. It literally traverses the graph edges from the concepts in your prompt to the exact documents that contain them.

**The result is Vectorless GraphRAG:** perfectly grounded answers with zero hallucinated citations, powered entirely by local models.

---

## 🧠 What We Learned: Orchestrating Local LLMs

Moving to local LLMs introduced a new problem: local inference is slow. Running a 12B parameter model over a 100-page document takes too long.

We learned that **not all extraction requires a massive model**. To solve the speed bottleneck, we implemented a three-tier extraction architecture:

* **`--method fast`**: Uses a lightning-fast 2B model to read just the first 5 pages of a document. For 80% of files, this is enough to extract accurate tags and entities.
* **`--method graph`**: Uses a large 12B reasoning model across the entire document for deep, comprehensive extraction.
* **`--method auto`**: This was our biggest breakthrough. We implemented an **"Orchestrator"** pattern. A tiny 4B model acts as a judge, analyzing chunks of the document as they stream in. As soon as the Orchestrator decides it has enough context to categorize the document, it halts the expensive 12B extraction process early. 

This hybrid approach gave us the deep understanding of a large model with the speed of a small one.

---

## 🛠️ Polishing the CLI Experience

An AI tool is only as good as its UX. If it acts like a black box that silently eats your files, nobody will trust it. 

We spent significant time in v0.1.0 polishing the CLI to match modern open-source standards:

* **Terraform-Style Plan/Apply:** Before moving a single file, the CLI outputs a beautiful `rich` terminal table showing exactly what clusters it found and where files will go, waiting for your `[Y/n]` confirmation.
* **Confidence Scoring:** We introduced graph-based confidence metrics. If the AI isn't sure about a document (based on entity edge density), it safely routes it to an `Unsorted/` folder rather than guessing incorrectly.
* **Silent Operations:** Taming the log-spew of AI libraries (like RapidOCR and PyTorch) was incredibly difficult. We implemented custom logging monkey-patches to ensure the CLI output remains pristine and user-friendly.

---

## 🚀 What Lies Ahead

v0.1.0 proves that local, vectorless GraphRAG is a viable and powerful way to manage personal knowledge. But we are just getting started.

Here is what is coming in the next phases of Semantic Organizer:
1. **The Watchdog Daemon:** A `semantic-organizer watch` command that runs invisibly in the background. Drop a file on your Desktop, and it will instantly disappear and route itself to the correct folder in your vault.
2. **`.semanticignore`:** Support for ignoring `node_modules` and hidden directories during vault scans.
3. **Interactive Setup Wizard:** A `semantic-organizer init` flow (like `git init`) that scaffolds a hidden workspace, sets up your global `config.yaml`, and automatically detects your active LM Studio models.

Semantic Organizer isn't just about cleaning up your Downloads folder anymore. It is about turning your local filesystem into an intelligent, queriable extension of your brain—without paying API subscriptions or giving up your data privacy. 

[Check out the code on GitHub and give it a spin!](https://github.com/TheNobody-12/semantic-organizer)
