#Most of the code is directly taken from: https://eprint.iacr.org/2020/1143.pdf

try:
    from sage.all import *
except ImportError:
    print("SageMath is not installed. Please run this script with sage: `sage parameter_generator.py`")

import hashlib

def SHAKE256(input_bytes, num_bytes):
    return hashlib.shake_256(input_bytes).digest(num_bytes)

def get_mds_matrix(p, m):

    # get a primitive element
    Fp = FiniteField(p)
    g = Fp(2)
    while g.multiplicative_order() != p - 1:
        g = g + 1
    
    # get a systematic generator matrix for the code
    V = matrix([[g**(i * j) for j in range(0, 2 * m)] for i in range(0, m)])
    V_ech = V.echelon_form()
    
    # the MDS matrix is the transpose of the right half of this matrix
    MDS = V_ech[:, m:].transpose()
    return MDS

def get_round_constants(p, m, capacity, security_level, N):

    # generate pseudorandom bytes
    # bin(p) returns '0b...', so len - 2 is bit length
    bytes_per_int = ceil(len(bin(p)[2:]) / 8) + 1
    num_bytes = bytes_per_int * 2 * m * N
    seed_string = "Rescue-XLIX(%i,%i,%i,%i)" % (p, m, capacity, security_level)
    
    byte_string = SHAKE256(bytes(seed_string, "ascii"), num_bytes)
    
    # process byte string in chunks
    round_constants = []
    Fp = FiniteField(p)
    for i in range(2 * m * N):
        chunk = byte_string[bytes_per_int * i : bytes_per_int * (i + 1)]
        # Convert chunk reference to integer
        # Logic: sum(256^j * chunk[j]) -> little endian?
        integer = sum(256**j * ZZ(chunk[j]) for j in range(len(chunk)))
        round_constants.append(Fp(integer % p))
        
    return round_constants

def get_alphas(p):

    for alpha in range(3, p):
        if gcd(alpha, p - 1) == 1:
            break
    
    g, alphainv, garbage = xgcd(alpha, p - 1)
    return (alpha, (alphainv % (p - 1)))

def get_number_of_rounds(p, m, capacity, security_level, alpha):

    # get number of rounds for Groebner basis attack
    rate = m - capacity
    dcon = lambda N: floor(0.5 * (alpha - 1) * m * (N - 1) + 2)
    v = lambda N: m * (N - 1) + rate
    target = 2**security_level
    
    l1 = 1
    for l1 in range(1, 25):
        if binomial(v(l1) + dcon(l1), v(l1))**2 > target:
            break
            
    # set a minimum value for sanity and add 50%
    return ceil(1.5 * max(5, l1))

def get_rescue_prime_parameters(p, m, capacity, security_level=128):
    """
    Helper to get all parameters in the order expected by the JS wrapper
    """
    alpha, alphainv = get_alphas(p)
    N = get_number_of_rounds(p, m, capacity, security_level, alpha)
    MDS = get_mds_matrix(p, m)
    round_constants = get_round_constants(p, m, capacity, security_level, N)
    
    return {
        "p": p,
        "m": m,
        "capacity": capacity,
        "security_level": security_level,
        "alpha": alpha,
        "alphainv": alphainv,
        "N": N,
        "MDS": MDS,
        "round_constants": round_constants
    }

if __name__ == "__main__":
    # Parameters from implementation.js
    p = 21888242871839275222246405745257275088548364400416034343698204186575808495617
    m = 2
    capacity = 1
    security_level = 128
    
    print(f"Generating parameters for p={p}, m={m}, capacity={capacity}, security_level={security_level}...")
    
    params = get_rescue_prime_parameters(p, m, capacity, security_level)
    
    # helper to format python list to JS array string
    def to_js_arr(arr):
        return "[" + ", ".join([str(x) + "n" for x in arr]) + "]"
    
    # helper for matrix
    def to_js_matrix(mat):
        rows = []
        for row in mat.rows():
            rows.append(to_js_arr(row))
        return "[\n" + ",\n".join(["        " + r for r in rows]) + "\n    ]"

    print("\n// Copy the following into `parameters.js` or directly into your code:")
    print("const parameters = [")
    print(f"    {params['p']}n, // p")
    print(f"    {params['m']}, // m")
    print(f"    {params['capacity']}, // capacity")
    print(f"    {params['security_level']}, // security_level")
    print(f"    {params['alpha']}n, // alpha")
    print(f"    {params['alphainv']}n, // alphainv")
    print(f"    {params['N']}, // N (number of rounds)")
    print(f"    {to_js_matrix(params['MDS'])}, // MDS Matrix")
    print(f"    {to_js_arr(params['round_constants'])} // Round Constants")
    print("];")

