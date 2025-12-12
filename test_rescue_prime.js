
const implementation = require('./implementation');

const { parameters } = require('./constants2');
const { rescue_prime_wrapper } = require('./implementation');

console.log("Running Rescue Prime Hash Test...");
const input = "Anand";
console.log("Input:", input);

try {
    const result = rescue_prime_wrapper(parameters, input);
    console.log("Hash Output (Evaluated):");
    console.log(result.map(x => x.toString()).join(', '));
    console.log("Test Passed: Hash generated successfully.");
} catch (e) {
    console.error("Test Failed:", e);
    process.exit(1);
}
