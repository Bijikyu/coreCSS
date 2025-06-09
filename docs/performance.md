# Performance Testing

This document explains how to measure download times for `core.min.css` when served from jsDelivr and GitHub Pages. It uses a Node script to simulate concurrent downloads and calculate average response times. The script now queues requests with [`p-limit`](https://www.npmjs.com/package/p-limit) so only a handful run at once.

## Running the test script

1. Install dependencies:
   ```bash
   npm install axios qerrors
   ```
2. Execute the script specifying how many download attempts to run (defaults to `5`). The queue size can be overridden with the `QUEUE_LIMIT` environment variable and defaults to `5`:
   ```bash
   node scripts/performance.js 10 --json
   ```
   The optional `--json` flag appends a timestamped entry to `performance-results.json` for automation. The script fetches `core.<hash>.min.css` when `build.hash` exists, otherwise it falls back to `core.min.css`. When `CODEX=True` it mocks network calls for offline testing.

The output shows the average download time in milliseconds for each provider. Increase the value up to `50` to run more attempts while still queuing them according to `QUEUE_LIMIT` (default `5`). Values above `50` will trigger a warning and be capped at `50`.

## Manual checklist

If you prefer testing manually or need to verify results with tools of your choice, use the following steps:

1. Choose a reasonable run count, such as 10 download attempts, keeping in mind the script will cap values at `50` and queue requests in groups defined by `QUEUE_LIMIT` (default `5`).
2. Measure download times with your preferred tool (`curl`, `ab`, `wrk`, etc.) against the file specified in `build.hash` when present:
   - `https://cdn.jsdelivr.net/gh/Bijikyu/qoreCSS/core.<hash>.min.css`
   - `https://bijikyu.github.io/qoreCSS/core.<hash>.min.css`
   If the hash file is missing use `core.min.css` in both URLs instead.
3. Record the average, minimum, and maximum times.
4. Repeat the test during peak hours to account for CDN traffic.
5. Compare the results to identify bottlenecks or slowdowns under load.
