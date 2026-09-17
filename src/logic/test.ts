import * as fs from 'fs';
import * as path from 'path';
import { handleAnswer, AppState } from './engine';

// 1. Load your JSON state
const dataPath = path.join(__dirname, '../data/curriculum.json');
const initialState: AppState = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log("=== COGNITREE LOGIC TEST ===\n");

console.log("Current Status of Single Bracket Node:", initialState.nodes.find(n => n.id === 'node-single-bracket')?.status);
console.log("Current Status of Double Bracket Node:", initialState.nodes.find(n => n.id === 'node-double-bracket')?.status);

console.log("\n--- SIMULATING A WRONG ANSWER ---");
console.log("Student is on 'node-double-bracket' and selects option 'opt-1' (factorising error).");
console.log("This distractor is mapped to the 'node-single-bracket' misconception.\n");

// 2. Run the logic! (opt-1 triggers the misconception node-single-bracket)
const result = handleAnswer(initialState, 'node-double-bracket', 'opt-1');

// 3. See the results
console.log("Diagnostic Message Returned to UI:");
console.log(`> "${result.diagnosticMessage}"\n`);   

console.log("Updated Status of Single Bracket Node (Should now be 'gap' so the UI turns it red):");
console.log(`> Status: ${result.newState.nodes.find(n => n.id === 'node-single-bracket')?.status}`);

console.log("\n--- SIMULATING A CORRECT ANSWER ---");
const result2 = handleAnswer(initialState, 'node-double-bracket', 'opt-2'); // Correct answer
console.log("Updated Status of Double Bracket Node:");
console.log(`> Status: ${result2.newState.nodes.find(n => n.id === 'node-double-bracket')?.status}`);
console.log("Updated Status of Algebraic Fractions Node (Should now be unlocked!):");
console.log(`> Status: ${result2.newState.nodes.find(n => n.id === 'node-algebraic-fractions')?.status}`);
