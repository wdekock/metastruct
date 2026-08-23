import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compileSystem } from "../../../packages/compiler/dist/index.js";

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcesDir = path.join(appDir, "sources");
const outputPath = path.join(appDir, "manifests", "system_manifest.json");
const entityFiles = [
  "client_entity_spec.json",
  "address_entity_spec.json",
  "client_address_entity_spec.json",
  "address_type_entity_spec.json",
];

const entities = Object.fromEntries(
  entityFiles.map((fileName) => {
    const entity = JSON.parse(fs.readFileSync(path.join(sourcesDir, fileName), "utf8"));
    return [entity.title, entity];
  }),
);

const manifest = compileSystem({
  systemId: "client-address-system",
  version: "1.0.0",
  entities,
  questionnaires: {},
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${outputPath}`);
