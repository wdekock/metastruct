import {
  CompileContext,
  MasterCompiler,
  SystemManifest,
} from './master_compiler.js';

export class BrowserCompiler {
  private readonly masterCompiler: MasterCompiler;

  constructor() {
    this.masterCompiler =
      new MasterCompiler();
  }

  public compileInMemory(
    context: CompileContext
  ): SystemManifest {
    return this.masterCompiler.compile(
      context
    );
  }
}
