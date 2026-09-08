# k6 performance tests

Run these commands from the project root.

```powershell
$env:BASE_URL='http://192.168.0.27'
k6 run .\performance\smoke.js
k6 run .\performance\load.js
```

The generated JSON summaries are saved under `performance/results`.

Run `smoke.js` first. Run `load.js` only against an approved test target, and
monitor the application, MySQL, CPU, and memory while it is running.
