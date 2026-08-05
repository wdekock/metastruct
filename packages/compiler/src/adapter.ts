import { SystemManifest, MasterCompiler } from "./master_compiler.js";

export function adaptToSystemManifest(rawManifest: any): SystemManifest {
  // If already in new shape, return directly
  if (rawManifest && rawManifest.entityName && rawManifest.schema && rawManifest.layout) {
    return rawManifest as SystemManifest;
  }

  // Handle legacy shape (manifest.entity, manifest.ui, manifest.workflow)
  if (rawManifest && rawManifest.entity) {
    const compiler = new MasterCompiler();
    return compiler.compile(
      rawManifest.entity,
      rawManifest.ui,
      rawManifest.workflow
    );
  }

  throw new Error("Invalid manifest payload: Cannot adapt given object to SystemManifest.");
}
