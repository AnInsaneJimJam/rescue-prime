# Rescue Prime Hash Implementation

This repository contains a **JavaScript** and **Circom** implementation of the **Rescue Prime** hash function, optimized for Zero Knowledge Proofs.

## 🚀 Features

- **Field Native**: Operates natively on the BN254 scalar field ($p \approx 2^{254}$).
- **Sponge Construction**: Standard sponge used for hashing arbitrary length inputs.
- **ZK Optimized**: The Circom circuit uses witness-assisted inverse S-Box calculation to minimize constraints.
- **Verified**: JavaScript implementation matches the paper's specification and includes automated tests.

## 📁 Project Structure

```bash
.
├── js_implementation/
│   ├── implementation.js       # Core JS implementation
│   ├── parameters.js           # Parameter file
│   └── index.js                # Entry point
│
├── circom_implementation/
│   ├── rescue_prime.circom     # Main Circuit implementation
│   ├── constants.circom        # Auto-generated Circom constants
│   └── test_hash.circom        # Test circuit entry point
│
└── helpers/
    ├── generate_circom_constants.js # Script to sync JS constants -> Circom
    └── parameter_generator.py       # SageMath parameter generator
```

## 🛠️ Usage

### JavaScript
Run the test script to hash inputs (e.g., "Anand"):
```bash
node test_rescue_prime.js
```

**Output:**
```
Running Rescue Prime Hash Test...
Input: Anand
Hash Output:
21045015688200378808705735982226289586504771227183255127875896538754607270947
```

### Circom Circuit
To compile the circuit:
```bash
cd circom_implementation
circom test_hash.circom --r1cs --wasm --sym
```

The `RescuePrimeHash(N)` component takes `N` field elements as input.
**Note on Padding**: The circuit expects external padding. Use the JS wrapper to generate padded inputs before passing them to the circuit witness generator.

## 🔐 Technical Details

| Parameter | Value | Description |
| :--- | :--- | :--- |
| **Prime (p)** | `2188...5617` | BN254 Scalar Field |
| **State Size (m)** | `2` | 2 Field Elements |
| **Capacity (c)** | `1` | 128-bit Security |
| **Rate (r)** | `1` | `m - c` |
| **Alpha** | `5` | S-Box Exponent ($x^5$) |
| **Rounds (N)** | `20` | Security Rounds |

### Circuit Optimization
Instead of computing $y = x^{\alpha^{-1}}$ (which is expensive), the circuit calculates the witness `y` via a hint (`<--`) and enforces $x = y^\alpha$ (`===`), reducing the S-Box cost significantly.

---
*Implementation based on the [Rescue Prime Specification](https://eprint.iacr.org/2020/1143.pdf).*
