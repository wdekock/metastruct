import {
  CompileContext,
  MasterCompiler,
  SystemManifest,
} from './master_compiler.js';

export function compileSystem(
  context: CompileContext
): SystemManifest {
  const compiler = new MasterCompiler();
  return compiler.compile(context);
}

export function adaptToSystemManifest(
  rawManifest: unknown
): SystemManifest {
  if (!rawManifest || typeof rawManifest !== 'object') {
    throw new Error(
      'Invalid manifest payload.'
    );
  }

  const candidate =
    rawManifest as Partial<SystemManifest>;

  /*
   * A compiled System Manifest is already immutable runtime data.
   */
  if (
    typeof candidate.systemId === 'string' &&
    typeof candidate.version === 'string' &&
    typeof candidate.compiledAt === 'string' &&
    candidate.entities &&
    candidate.questionnaires
  ) {
    return candidate as SystemManifest;
  }

  throw new Error(
    'Invalid System Manifest. Expected the canonical compiled manifest shape.'
  );
}
