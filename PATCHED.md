# MathLive (Patched)

Personal distribution of MathLive with the accumulated accent, cursor, matrix-font, inline/display conversion, spacing, and dots fixes. Based on upstream 2.7.0.

Install through BRAT using `jacobleft/obsidian-mathlive` and track the latest release. The plugin ID is `mathlive`: this replaces the official package as the sole MathLive installation. Use BRAT to update from this fork. Obsidian’s community updater can overwrite it when the official version is newer.

The `patched` branch carries distribution metadata on top of the combined fixes branch. Keep upstream PR branches separate. Merge future preserved-fixes updates into `patched`, retain the original `mathlive` ID/name, and increment the numeric release version (currently `2.7.101`). BRAT coerces version numbers, so suffix-only changes such as `-patched.2` do not reliably trigger updates.

To publish: run `npm run lint` and `npm run build`, commit and push `patched`, then create a GitHub release in this fork with `main.js`, `manifest.json`, and `styles.css` attached. The tag must match the manifest version. Never attach vault settings or `data.json`.
