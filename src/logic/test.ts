import * as fs from 'fs';
import * as path from 'path';
import { handleAnswer, AppState } from './engine';

// 1. Load your JSON state
const dataPath = path.join(__dirname, '../data/curriculum.json');
const initialState: AppState = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log("=== COGNITREE LOGIC TEST ===\n");

console.log("Current Status of Area Node:", initialState.nodes.find(n => n.id === 'node-area')?.status);
console.log("Current Status of Multiplication Node:", initialState.nodes.find(n => n.id === 'node-multiplication')?.status);

console.log("\n--- SIMULATING A WRONG ANSWER ---");
console.log("Student is on 'node-area' and selects answer '10' (they added 6+4 instead of multiplying).");
console.log("This distractor is mapped to the 'node-multiplication' misconception.\n");

// 2. Run the logic! (opt-2 is the wrong answer that triggers the misconception)
const result = handleAnswer(initialState, 'node-area', 'opt-2');

// 3. See the results
console.log("Diagnostic Message Returned to UI:");
console.log(`> "${result.diagnosticMessage}"\n`);

console.log("Updated Status of Multiplication Node (Should now be 'gap' so the UI turns it red):");
console.log(`> Status: ${result.newState.nodes.find(n => n.id === 'node-multiplication')?.status}`);

console.log("\n--- SIMULATING A CORRECT ANSWER ---");
const result2 = handleAnswer(initialState, 'node-multiplication', 'opt-1'); // Correct answer to multiplication
console.log("Updated Status of Multiplication Node:");
console.log(`> Status: ${result2.newState.nodes.find(n => n.id === 'node-multiplication')?.status}`);
console.log("Updated Status of Area Node (Should now be unlocked!):");
console.log(`> Status: ${result2.newState.nodes.find(n => n.id === 'node-area')?.status}`);
