#!/usr/bin/env node
import { Program } from '../dist/Program.js';
import packageJson from '../package.json' with { type: "json" };

const program = new Program({
  name: packageJson.name,
  description: 'Simpler CLIs with Code Generation in mind',
  version: packageJson.version
});

await program.run();
