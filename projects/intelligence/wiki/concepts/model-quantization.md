---
created_at: 2026-04-09
last_updated: 2026-04-09
---

# Model Quantization

> TLDR: Quantization reduces LLM memory footprint by storing weights as small integers instead of full-precision floats — 8-bit carries almost no quality penalty, 4-bit is ~90% quality, and 2-bit collapses most models. Speed often improves as a bonus.

## The Problem

LLM parameters (weights) dominate memory usage. A 80B parameter model at 32-bit float precision requires ~320GB of RAM. Frontier models rumored to have 1T+ parameters would need petabytes. Quantization compresses weights into smaller integer formats so capable models can run on consumer hardware.

Most LLM weights cluster near zero — very small values. This makes quantization effective: the precision loss from rounding near-zero values is small, and only a few outlier weights cause trouble.

## How It Works

**Basic principle:** Map floating-point values into a smaller integer range using a scale factor. On inference, dequantize on-the-fly before computation.

**Symmetric quantization:** Scale around zero. Find largest absolute value, divide by max integer value to get scale factor. Simple, but wastes bits when data isn't centered.

**Asymmetric quantization:** Find actual data range (min and max), map it to the full integer range. Adds a zero-point offset. ~10% lower error than symmetric for the same bit depth.

**Block-wise quantization:** Critical in practice. Quantizing all weights at once fails badly because outlier values compress everything else into near-zero. Instead, quantize 32–256 weights at a time. Each block has its own scale (and zero-point for asymmetric). Overhead: stored alongside weights, tradeoff between block size and accuracy.

## Quality Benchmarks (Qwen 3.5 9B)

| Format | Perplexity | KL Divergence | Benchmark Performance |
|--------|-----------|---------------|----------------------|
| 16-bit (baseline) | — | 0 | 100% |
| 8-bit symmetric | Near-identical | Very low | Slightly better (noise) |
| 4-bit (various) | Small degradation | Moderate | ~90% |
| 2-bit | Significant | High | ~0% (model breaks) |

The quality cliff exists but isn't linear — 16-bit to 8-bit is nearly free, 16-bit to 4-bit retains ~90% quality. 2-bit is generally unusable for most models.

## Evaluation Methods

Three ways to measure quantization impact:

1. **Perplexity** — Lower is better. Measures how confident the model is in its token predictions. Simple but only considers the probability of the correct token.

2. **KL Divergence** — Measures how much the full token probability distribution changes after quantization. More comprehensive than perplexity but harder to interpret intuitively (no natural scale, only comparable within the same model).

3. **Benchmarks and vibe testing** — Run standard benchmarks (GPQA, MMLU) and just ask questions. Less rigorous but contextualizes other scores. For critical use cases, build task-specific evaluations.

## Practical Notes

- **8-bit is almost always worth it** — Nearly free quality for 2x memory reduction and speed improvement
- **4-bit is a good default for running locally** — Apps like llama.cpp offer Q4 variants for most popular models
- **Speed improves with quantization** (usually) — Less data to move through GPU memory. 8-bit and 4-bit are meaningfully faster than 16-bit on most hardware
- **Outlier weights are the enemy** — Block-wise quantization exists to contain them; tools like AWQ and GPTQ handle outliers more cleverly

## Advanced Methods

- **Post-Training Quantization (PTQ)** — Applied after training. What most users do. What this page covers.
- **Quantization-Aware Training (QAT)** — Simulates quantization during pre-training so the model learns weights that quantize well. More expensive but higher quality output.
- **AWQ (Activation-aware Weight Quantization)** — Preserves salient weights; better than naive PTQ at 4-bit
- **GPTQ** — Layer-wise quantization using approximate second-order information; commonly used for 4-bit
- **Other efficiency methods:** Parameter pruning, knowledge distillation

## Tooling

- **llama.cpp** — De facto standard for running quantized models locally. GGUF format. Provides perplexity, KL divergence, and speed benchmarking tools.
- **Ollama** — User-friendly wrapper around llama.cpp
- **HuggingFace** — Hub for quantized model variants

## Sources

- "Quantization from the ground up" — Sam Rose (Apr 2026) ([link](https://ngrok.com/blog/quantization))
