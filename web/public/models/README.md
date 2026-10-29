# Optional GLB upgrade (not implemented, procedural bones are used)

The scenes are fully procedural (`src/components/three/scenes/anatomy.ts`). To replace the knee with a scanned model:

1. Get a **CC0 / public-domain only** knee model (never CC-BY, CC-BY-SA or any licence with conditions). Record the source URL and CC0 proof in `ATTRIBUTION.md`.
2. Optimize: `npx gltfjsx knee.glb --transform` (Draco + 1k textures) and save as `public/models/knee.glb`.
3. Copy the decoder: `cp node_modules/three/examples/jsm/libs/draco/gltf/* public/draco/` and load with `useGLTF("/models/knee.glb", "/draco/")`.
4. Map mesh names to `PartKey`s in `knee-model.tsx` (femur, tibia, fibula, patella, cart, menisci, acl, pcl), keeping the same materials so highlight/dim/explode logic keeps working.
