---
title: "Hello World — Starting the Lab Notebook"
slug: "hello-world"
date: "2025-07-10"
tags: ["meta", "machine-learning"]
excerpt: "Why I'm turning my portfolio into a living lab notebook and what you can expect to find here."
draft: false
---


This is the first post on my new lab notebook. I built this space so I can share short write-ups about the experiments, failures, and lessons that don't fit neatly into a resume or a GitHub README.

## What you'll find here

- **ML & MLOps notes** from production systems.
- **Computer vision** experiments, from edge devices to cloud pipelines.
- **Knowledge graphs & retrieval** patterns for GenAI applications.
- **Forecasting** workflows and time-series gotchas.

## A quick code example

```python
import pandas as pd
from prophet import Prophet

df = pd.read_csv('timeseries.csv')
m = Prophet()
m.fit(df)
future = m.make_future_dataframe(periods=30)
forecast = m.predict(future)
```

More soon.
