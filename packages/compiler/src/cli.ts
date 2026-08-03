#!/usr/bin/env node
import { MasterCompiler } from './master_compiler';
import * as path from 'path';

async function runCLI() {
  const rootDir = process.cwd();
  
  const domainSrcDir = path.join(rootDir, 'packages/domain-contracts/src');
  const distOutputDir = path.join(rootDir, 'packages/domain-contracts/dist');

  const compiler = new MasterCompiler();
  try {
    await compiler.compile({ domainSrcDir, distOutputDir });
    process.exit(0);
  } catch (error) {
    console.error('💥 Compilation Failed:', error);
    process.exit(1);
  }
}

runCLI();
