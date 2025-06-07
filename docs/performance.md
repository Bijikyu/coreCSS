# Performance Testing

This document explains how to measure download times for `core.min.css` when served from jsDelivr and GitHub Pages. It uses a Node script to simulate concurrent downloads and calculate average response times.

## Running the test script

1. Install dependencies:
   ```bash
   npm install axios qerrors
   ```
2. Execute the script specifying the number of concurrent requests (defaults to `5`):
   ```bash
   node scripts/performance.js 10 --json
   ```
   The optional `--json` flag appends a timestamped entry to `performance-results.json` for automation. The script fetches `core.<hash>.min.css` when `build.hash` exists, otherwise it falls back to `core.min.css`. When `CODEX=True` it mocks network calls for offline testing.

The output shows the average download time in milliseconds for each provider. Increase the concurrency value to check behavior under heavier load.

## Manual checklist

If you prefer testing manually or need to verify results with tools of your choice, use the following steps:

1. Choose a reasonable concurrency level, such as 10 simultaneous requests.
2. Measure download times with your preferred tool (`curl`, `ab`, `wrk`, etc.) against the file specified in `build.hash` when present:
   - `https://cdn.jsdelivr.net/gh/Bijikyu/qoreCSS/core.<hash>.min.css`
   - `https://bijikyu.github.io/qoreCSS/core.<hash>.min.css`
   If the hash file is missing use `core.min.css` in both URLs instead.
3. Record the average, minimum, and maximum times.
4. Repeat the test during peak hours to account for CDN traffic.
5. Compare the results to identify bottlenecks or slowdowns under load.
