
const fs = require('fs');
const { parameters } = require('../js_implementation/parameters');

const [p, m, capacity, security_level, alpha, alphainv, N, MDS, round_constants] = parameters;

let circomContent = "pragma circom 2.0.0;\n\n";

circomContent += "function getRounds() {\n";
circomContent += `    return ${N};\n`;
circomContent += "}\n\n";

circomContent += "function getM() {\n";
circomContent += `    return ${m};\n`;
circomContent += "}\n\n";

circomContent += "function getAlpha() {\n";
circomContent += `    return ${alpha};\n`;
circomContent += "}\n\n";

// MDS Matrix
circomContent += `function getMDS(i, j) {\n`;
circomContent += `    var MDS[${m}][${m}];\n`;
for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) {
        circomContent += `    MDS[${i}][${j}] = ${MDS[i][j]};\n`;
    }
}
circomContent += `    return MDS[i][j];\n`;
circomContent += "}\n\n";

// Round Constants
// Flattening round constants
circomContent += `function getRoundConstant(k) {\n`;
circomContent += `    var RC[${round_constants.length}];\n`;
for (let i = 0; i < round_constants.length; i++) {
    circomContent += `    RC[${i}] = ${round_constants[i]};\n`;
}
circomContent += `    return RC[k];\n`;
circomContent += "}\n";

fs.writeFileSync('../circom_implementation/constants.circom', circomContent);
console.log("constants.circom generated");
