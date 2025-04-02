"""
Qiskit Integration Backend

This Flask application serves as a backend for the quantum circuit simulator,
providing integration with Qiskit for simulation and execution on quantum hardware.

Requirements:
- Flask
- qiskit
- qiskit-aer
- numpy
- python-dotenv

To run:
python app.py
"""

import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from qiskit import QuantumCircuit, transpile
from qiskit_aer import Aer
from qiskit.quantum_info import Statevector, DensityMatrix, partial_trace
from qiskit.quantum_info import entropy
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Check if IBM Quantum credentials are available
IBM_TOKEN = os.getenv('IBM_QUANTUM_TOKEN')
provider = None

# Note: IBM Provider is optional, so we'll make the integration work even without it
try:
    from qiskit_ibm_provider import IBMProvider
    if IBM_TOKEN:
        try:
            IBMProvider.save_account(IBM_TOKEN, overwrite=True)
            provider = IBMProvider()
            print("IBM Quantum account loaded successfully")
        except Exception as e:
            print(f"Error loading IBM Quantum account: {e}")
            provider = None
    else:
        print("No IBM Quantum token found, using local simulators only")
except ImportError:
    print("qiskit_ibm_provider not available, using local simulators only")
    provider = None

@app.route('/api/qiskit/backends', methods=['GET'])
def get_backends():
    """Get available Qiskit backends"""
    backends = []
    
    # Add local simulators
    simulators = [
        {
            'name': 'simulator',
            'type': 'simulator',
            'description': 'Local statevector and QASM simulator',
            'num_qubits': 32
        },
        {
            'name': 'statevector_simulator',
            'type': 'simulator',
            'description': 'Local statevector simulator',
            'num_qubits': 32
        },
        {
            'name': 'qasm_simulator',
            'type': 'simulator',
            'description': 'Local QASM simulator',
            'num_qubits': 32
        }
    ]
    backends.extend(simulators)
    
    # Add IBM Quantum backends if available
    if provider:
        for backend in provider.backends():
            try:
                config = backend.configuration()
                backends.append({
                    'name': backend.name,
                    'type': 'quantum' if not getattr(config, 'local', True) else 'simulator',
                    'description': f"IBM Quantum {backend.name}",
                    'num_qubits': config.num_qubits,
                    'status': backend.status().status_msg
                })
            except Exception as e:
                print(f"Error getting backend info: {e}")
                # Skip if we can't get backend info
                pass
    
    return jsonify(backends)

@app.route('/api/qiskit', methods=['POST'])
def run_qiskit_circuit():
    """
    Run a quantum circuit using Qiskit.
    
    Request body should contain:
    {
        "circuit": {
            "numQubits": number,
            "initialStates": array of "0" or "1",
            "gates": [
                {
                    "name": string (e.g., "h", "x", "cx"),
                    "qubits": array of indices,
                    "position": number
                },
                ...
            ]
        },
        "options": {
            "backend": string (e.g., "simulator", "ibmq_manila"),
            "shots": number,
            "optimization_level": number (0-3)
        }
    }
    """
    try:
        data = request.json
        circuit_data = data.get('circuit')
        options = data.get('options', {})
        
        # Create quantum circuit
        num_qubits = circuit_data.get('numQubits')
        qc = QuantumCircuit(num_qubits, num_qubits)
        
        # Initialize qubits based on initial states
        initial_states = circuit_data.get('initialStates', ['0'] * num_qubits)
        for i, state in enumerate(initial_states):
            if state == '1':
                qc.x(i)
        
        # Add gates to the circuit - sort by position to maintain order
        gates = circuit_data.get('gates', [])
        sorted_gates = sorted(gates, key=lambda g: g.get('position', 0))
        
        for gate in sorted_gates:
            name = gate.get('name')
            qubits = gate.get('qubits')
            
            if name == 'h' and len(qubits) == 1:
                qc.h(qubits[0])
            elif name == 'x' and len(qubits) == 1:
                qc.x(qubits[0])
            elif name == 'y' and len(qubits) == 1:
                qc.y(qubits[0])
            elif name == 'z' and len(qubits) == 1:
                qc.z(qubits[0])
            elif name == 's' and len(qubits) == 1:
                qc.s(qubits[0])
            elif name == 't' and len(qubits) == 1:
                qc.t(qubits[0])
            elif name == 'cx' and len(qubits) == 2:
                qc.cx(qubits[0], qubits[1])
            elif name == 'cz' and len(qubits) == 2:
                qc.cz(qubits[0], qubits[1])
            elif name == 'swap' and len(qubits) == 2:
                qc.swap(qubits[0], qubits[1])
            elif name == 'measure' and len(qubits) == 1:
                qc.measure(qubits[0], qubits[0])
            else:
                return jsonify({
                    'error': f'Unsupported gate: {name} with qubits {qubits}'
                }), 400
        
        # Execute the circuit based on the backend option
        backend_name = options.get('backend', 'simulator')
        shots = options.get('shots', 1024)
        optimization_level = options.get('optimization_level', 1)
        
        # For statevector simulation
        statevector_result = None
        counts_result = None
        
        if backend_name == 'simulator' or backend_name == 'statevector_simulator':
            # Run on statevector simulator
            sv_simulator = Aer.get_backend('statevector_simulator')
            transpiled_circuit = transpile(qc, sv_simulator)
            sv_job = sv_simulator.run(transpiled_circuit)
            sv_result = sv_job.result()
            
            # Get statevector using Qiskit's Statevector class
            statevector = Statevector(sv_result.get_statevector())
            
            # Convert statevector to JSON-serializable format
            statevector_result = []
            for amplitude in statevector.data:
                statevector_result.append({
                    're': float(amplitude.real),
                    'im': float(amplitude.imag)
                })
            
            # Calculate density matrix
            dm = DensityMatrix(statevector)
            density_matrix = []
            for i in range(2**num_qubits):
                row = []
                for j in range(2**num_qubits):
                    value = dm.data[i, j]
                    row.append({
                        're': float(value.real),
                        'im': float(value.imag)
                    })
                density_matrix.append(row)
            
            # Calculate reduced density matrices for each qubit
            reduced_density_matrices = []
            entanglement_entropies = []
            
            for qubit in range(num_qubits):
                # Create list of qubits to trace out (all except this one)
                qubits_to_trace = [q for q in range(num_qubits) if q != qubit]
                
                # Calculate partial trace
                reduced_dm = partial_trace(dm, qubits_to_trace)
                
                # Calculate entropy
                entropy_value = entropy(reduced_dm)
                entanglement_entropies.append(float(entropy_value))
                
                # Convert to JSON-serializable format
                reduced_matrix = []
                for i in range(2):
                    row = []
                    for j in range(2):
                        value = reduced_dm.data[i, j]
                        row.append({
                            're': float(value.real),
                            'im': float(value.imag)
                        })
                    reduced_matrix.append(row)
                
                reduced_density_matrices.append(reduced_matrix)
            
            # Also run on QASM simulator for counts
            qasm_simulator = Aer.get_backend('qasm_simulator')
            transpiled_qasm = transpile(qc, qasm_simulator, optimization_level=optimization_level)
            qasm_job = qasm_simulator.run(transpiled_qasm, shots=shots)
            qasm_result = qasm_job.result()
            counts = qasm_result.get_counts()
            
            # Convert counts to JSON-serializable format
            counts_result = {}
            for state, count in counts.items():
                counts_result[state] = count
        
        elif provider and backend_name in [b.name for b in provider.backends()]:
            # Run on IBM Quantum backend
            backend = provider.get_backend(backend_name)
            transpiled_circuit = transpile(qc, backend, optimization_level=optimization_level)
            job = backend.run(transpiled_circuit, shots=shots)
            
            # Return job ID for later retrieval
            return jsonify({
                'job_id': job.job_id(),
                'status': 'submitted',
                'backend': backend_name
            })
        
        else:
            return jsonify({
                'error': f'Backend {backend_name} not available'
            }), 400
        
        # Return simulation results
        return jsonify({
            'circuit': {
                'numQubits': num_qubits,
                'depth': len(sorted_gates)
            },
            'statevector': statevector_result,
            'counts': counts_result,
            'density_matrix': density_matrix,
            'reduced_density_matrices': reduced_density_matrices,
            'entanglement_entropies': entanglement_entropies
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/api/qiskit/jobs/<job_id>', methods=['GET'])
def get_job_status(job_id):
    """Get the status of a submitted job"""
    if not provider:
        return jsonify({'error': 'IBM Quantum provider not available'}), 400
    
    try:
        job = provider.backend.retrieve_job(job_id)
        status = job.status()
        
        if status.name == 'DONE':
            # Job completed, return results
            result = job.result()
            counts = result.get_counts()
            
            # Convert counts to JSON-serializable format
            counts_result = {}
            for state, count in counts.items():
                counts_result[state] = count
            
            return jsonify({
                'job_id': job_id,
                'status': status.name,
                'counts': counts_result
            })
        else:
            # Job still running
            return jsonify({
                'job_id': job_id,
                'status': status.name,
                'message': status.value
            })
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/api/qiskit/code', methods=['POST'])
def generate_qiskit_code():
    """Generate Qiskit Python code for a given circuit"""
    try:
        data = request.json
        circuit_data = data.get('circuit')
        
        # Create quantum circuit
        num_qubits = circuit_data.get('numQubits')
        initial_states = circuit_data.get('initialStates', ['0'] * num_qubits)
        gates = circuit_data.get('gates', [])
        sorted_gates = sorted(gates, key=lambda g: g.get('position', 0))
        
        # Generate Python code
        code = "from qiskit import QuantumCircuit, transpile\n"
        code += "from qiskit_aer import Aer\n"
        code += "from qiskit.visualization import plot_histogram, plot_bloch_multivector\n"
        code += "import numpy as np\n\n"
        
        code += f"# Create a quantum circuit with {num_qubits} qubits\n"
        code += f"qc = QuantumCircuit({num_qubits}, {num_qubits})\n\n"
        
        # Add initialization
        for i, state in enumerate(initial_states):
            if state == '1':
                code += f"qc.x({i})  # Initialize qubit {i} to |1⟩\n"
        
        code += "\n# Add gates to the circuit\n"
        
        # Add gates
        for gate in sorted_gates:
            name = gate.get('name')
            qubits = gate.get('qubits')
            position = gate.get('position', 0)
            
            if name == 'h' and len(qubits) == 1:
                code += f"qc.h({qubits[0]})  # Hadamard gate\n"
            elif name == 'x' and len(qubits) == 1:
                code += f"qc.x({qubits[0]})  # X gate\n"
            elif name == 'y' and len(qubits) == 1:
                code += f"qc.y({qubits[0]})  # Y gate\n"
            elif name == 'z' and len(qubits) == 1:
                code += f"qc.z({qubits[0]})  # Z gate\n"
            elif name == 's' and len(qubits) == 1:
                code += f"qc.s({qubits[0]})  # S gate\n"
            elif name == 't' and len(qubits) == 1:
                code += f"qc.t({qubits[0]})  # T gate\n"
            elif name == 'cx' and len(qubits) == 2:
                code += f"qc.cx({qubits[0]}, {qubits[1]})  # CNOT gate\n"
            elif name == 'cz' and len(qubits) == 2:
                code += f"qc.cz({qubits[0]}, {qubits[1]})  # CZ gate\n"
            elif name == 'swap' and len(qubits) == 2:
                code += f"qc.swap({qubits[0]}, {qubits[1]})  # SWAP gate\n"
            elif name == 'measure' and len(qubits) == 1:
                code += f"qc.measure({qubits[0]}, {qubits[0]})  # Measure qubit\n"
        
        code += "\n# Draw the circuit\n"
        code += "print(qc.draw())\n\n"
        
        code += "# Simulate the circuit\n"
        code += "simulator = Aer.get_backend('statevector_simulator')\n"
        code += "job = simulator.run(transpile(qc, simulator))\n"
        code += "result = job.result()\n"
        code += "statevector = result.get_statevector()\n\n"
        
        code += "# Print the state vector\n"
        code += "print('\\nState vector:')\n"
        code += "print(statevector)\n\n"
        
        code += "# Calculate probabilities\n"
        code += "probabilities = {}\n"
        code += "for i, amplitude in enumerate(statevector):\n"
        code += f"    if abs(amplitude) > 1e-6:  # Ignore very small amplitudes\n"
        code += f"        state = format(i, '0{num_qubits}b')  # Convert to binary\n"
        code += "        probability = abs(amplitude)**2\n"
        code += "        probabilities[state] = probability\n"
        code += "        print(f'|{state}⟩: {probability:.4f}')\n\n"
        
        code += "# Run on QASM simulator for measurement results\n"
        code += "qasm_simulator = Aer.get_backend('qasm_simulator')\n"
        code += "job = qasm_simulator.run(transpile(qc, qasm_simulator), shots=1024)\n"
        code += "result = job.result()\n"
        code += "counts = result.get_counts(qc)\n"
        code += "print('\\nCounts:', counts)\n"
        code += "plot_histogram(counts)\n"
        
        return jsonify({
            'code': code
        })
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)