# SampahPintar — Issues

## [2026-02-22] Session ses_37adcd2e6ffeOHieb1PvFeMEUZ — Pre-work notes

### Known Windows Compatibility Items (non-blocking)
- QA scenarios use `convert` (ImageMagick) to create test images — not available on Windows. Use Node.js Buffer or a pre-existing small JPEG instead.
- QA scenarios use `/tmp/` path — use `os.tmpdir()` or relative path on Windows.
- `grep -r` in QA scenarios — use PowerShell `Select-String` or equivalent.

### Material Filter API Clarification
- Task 11 plan says `material` is optional single WasteCategory. Task 17 UI needs multi-select.
- DECISION: API should accept comma-separated materials (e.g., `?material=plastik,kertas`) for multiple selection. Backward compatible with single value.
