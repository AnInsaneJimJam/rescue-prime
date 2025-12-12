// This is rescue prime implementation based on specification stated here: https://eprint.iacr.org/2020/1143.pdf

function mod(n, p) {
    return ((n % p) + p) % p;
}

function modPow(base, exp, p) {
    let res = 1n;
    base = base % p;
    while (exp > 0n) {
        if (exp % 2n === 1n) res = (res * base) % p;
        base = (base * base) % p;
        exp /= 2n;
    }
    return res;
}

function matMul(M, v, p) {
    let m = v.length;
    let res = Array(m).fill(0n);
    for (let i = 0; i < m; i++) {
        let sum = 0n;
        for (let j = 0; j < m; j++) {
            sum = (sum + M[i][j] * v[j]) % p;
        }
        res[i] = sum;
    }
    return res;
}

function rescue_prime_wrapper(parameters, input_sequence) {
    let [p, m, capacity, security_level, alpha, alphainv, N, MDS, round_constants] = parameters;
    let rate = m - capacity;
    
    let elements = [];
    if (typeof input_sequence === 'string') {
        for (let i = 0; i < input_sequence.length; i++) {
            elements.push(BigInt(input_sequence.charCodeAt(i)));
        }
    } else if (Array.isArray(input_sequence)) {
        elements = input_sequence.map(x => BigInt(x));
    }

    elements.push(1n);
    while (elements.length % rate !== 0) {
        elements.push(0n);
    }

    return rescue_prime_hash(parameters, elements);
}


function rescue_prime_hash(parameters, input_sequence) {
    let [p, m, capacity, security_level, alpha, alphainv, N, MDS, round_constants] = parameters;
    let rate = m - capacity;

    let state = Array(m).fill(0n);

    let absorb_index = 0;
    while (absorb_index < input_sequence.length) {
        for (let i = 0; i < rate; i++) {
            if (absorb_index < input_sequence.length) {
                state[i] = mod(state[i] + input_sequence[absorb_index], p);
                absorb_index++;
            }
        }
        state = rescue_XLIX_permutation(parameters, state);
    }

    // Squeezing
    return state.slice(0, rate);
}

function rescue_XLIX_permutation(parameters, state) {
    let [p, m, capacity, security_level, alpha, alphainv, N, MDS, round_constants] = parameters;
    
    for (let i = 0; i < N; i++) {
        // 1. S-BOX: x -> x^alpha
        for (let j = 0; j < m; j++) {
            state[j] = modPow(state[j], alpha, p);
        }
        
        // 2. MDS: M * state
        state = matMul(MDS, state, p);
        
        // 3. Round Constants 
        for (let j = 0; j < m; j++) {
            state[j] = mod(state[j] + round_constants[i * 2 * m + j], p);
        }
        
        // 4. Inverse S-BOX: x -> x^(alphainv)
        for (let j = 0; j < m; j++) {
            state[j] = modPow(state[j], alphainv, p);
        }
        
        // 5. MDS: M * state
        state = matMul(MDS, state, p);
        
        // 6. Round Constants
        for (let j = 0; j < m; j++) {
            state[j] = mod(state[j] + round_constants[i * 2 * m + m + j], p);
        }
    }
    return state;
}

module.exports = { rescue_prime_hash, rescue_prime_wrapper, rescue_XLIX_permutation };





