#!/usr/bin/env node
import { Program } from '../dist/internals/Program.js';

const program = new Program();

await program.run();
