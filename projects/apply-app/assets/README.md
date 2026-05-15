# Game Assets

This project deploys a curated subset of models from several Kenney CC0 asset packs. The full downloaded packs are kept outside `public/` in `asset-sources/kenney-full-packs` so the browser build does not ship unused mobile weight.

- Fantasy Town Kit: https://kenney.nl/assets/fantasy-town-kit
- Nature Kit: https://kenney.nl/assets/nature-kit
- Modular Dungeon Kit: https://kenney.nl/assets/modular-dungeon-kit
- City Kit (Industrial): https://kenney.nl/assets/city-kit-industrial
- Graveyard Kit: https://kenney.nl/assets/graveyard-kit
- License: Creative Commons CC0
- Credit is appreciated by Kenney, but not required by the license.

The per-arena background music, ambient loops, and core gameplay cues are generated as WAV files by `scripts/generate-audio.mjs` during `npm run build`. The player character, rings, and small readable markers are original procedural Three.js geometry; the playable challenge props and set dressing use the curated Kenney model subsets above. Campaigns can point at their own model or audio folders, while the current campaigns reuse this shared curated subset.

The ElevenLabs voice cache under `public/assets/voice-cache/**` is intentionally deployable. Cache files live under `public/assets/voice-cache/<campaign>/voice_id_<voiceId>/`. Preserve and copy that folder when moving the site to a new host, otherwise cached voice lines may regenerate.
