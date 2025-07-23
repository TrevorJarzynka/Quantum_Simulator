A sophisticated quantum circuit simulator with real-time visualization, step-by-step execution, and professional Qiskit integration.

✨ Features
🎯 Interactive Circuit Building

Drag & Drop Interface: Intuitive gate placement with modern UI
Comprehensive Gate Library: Single-qubit (H, X, Y, Z, S, T) and multi-qubit gates (CNOT, CZ, SWAP)
Real-time Validation: Instant feedback on circuit structure and gate compatibility

🔬 Advanced Quantum Simulation

Step-by-Step Execution: Navigate through each gate operation
State Vector Evolution: Watch quantum superposition and entanglement develop
Mathematical Accuracy: Proper complex number arithmetic and unitary operations
Multiple Visualization Modes: Probability bars, Bloch spheres, and density matrices

🌐 Professional Integration

Qiskit Compatibility: Generate Python code for IBM Quantum hardware
Multiple Export Formats: OpenQASM, Qiskit, and custom JSON formats
Educational Tools: Built-in explanations and quantum mechanics principles

🚀 Getting Started
Prerequisites

Node.js (v16.0 or higher)
npm or yarn package manager
Python 3.7+ (optional, for Qiskit backend)

Quick Start
bash# Clone the repository
git clone https://github.com/yourusername/quantum-circuit-simulator.git
cd quantum-circuit-simulator

# Install dependencies
npm install

# Start the development server
npm start

# Open http://localhost:3000 in your browser
Optional: Qiskit Backend Setup
For real quantum hardware integration:
bash# Navigate to backend directory
cd src/qiskit-backend

# Install Python dependencies
pip install -r requirements.txt

# Set up IBM Quantum credentials (optional)
echo "IBM_QUANTUM_TOKEN=your_token_here" > .env

# Start the backend server
python app.py
🎮 How to Use
1. Build Your Circuit

Select gates from the Gate Palette on the left
Click on the Circuit Grid to place gates
Use the Initial State Controls to set qubit starting states
Remove gates by clicking the × button when hovering

2. Run Simulation

Click "Run Simulation" to execute your circuit
Use Step Controls to navigate through the execution
Watch the state evolution in real-time
Analyze results in the Visualization Panels

3. Export and Share

Enable Qiskit Integration for Python code generation
Copy or Download the generated code
Run on IBM Quantum hardware or simulators
Save your circuit as JSON for later use

🏗️ Architecture
quantum-simulator/
├── src/
│   ├── components/          # React UI components
│   │   ├── circuit/        # Circuit building interface
│   │   ├── simulation/     # Simulation controls
│   │   └── visualization/  # State visualizers
│   ├── hooks/              # Custom React hooks
│   │   ├── useCircuitState.js
│   │   ├── useQuantumSimulation.js
│   │   └── useQiskitIntegration.js
│   ├── services/           # Core simulation logic
│   │   ├── quantumSimulation/
│   │   └── qiskit/
│   ├── utils/              # Mathematical utilities
│   └── styles/             # Design system
└── qiskit-backend/         # Optional Python backend

🎨 Design System
Modern Quantum-Inspired UI

Dark Theme: Optimized for extended coding sessions
Glassmorphism: Translucent panels with backdrop blur
Smooth Animations: Apple-style easing and micro-interactions
Accessible: WCAG 2.1 compliant with keyboard navigation

Color Coding

🔵 Single-Qubit Gates: Blue gradient family
🟢 Multi-Qubit Gates: Green and teal variants
🟡 Measurement: Gold and amber tones
🔴 Errors: Clear red indicators
⚪ Probabilities: Gradient from white to blue

🔧 API Integration
Qiskit Backend Endpoints
python# Get available quantum backends
GET /api/qiskit/backends

# Execute quantum circuit
POST /api/qiskit
{
  "circuit": { "numQubits": 2, "gates": [...] },
  "options": { "backend": "ibmq_qasm_simulator", "shots": 1024 }
}

# Generate Python code
POST /api/qiskit/code
{
  "circuit": { "numQubits": 2, "gates": [...] }
}
Circuit Export Format
json{
  "numQubits": 3,
  "maxDepth": 10,
  "initialStates": [
    { "value": "0", "phase": 0 },
    { "value": "0", "phase": 0 },
    { "value": "1", "phase": 0 }
  ],
  "circuit": [
    [
      { "gate": { "id": "h", "name": "H", "description": "Hadamard" } },
      { "gate": null },
      { "gate": { "id": "cx", "control": true } }
    ]
  ]
}
🧪 Advanced Features
Quantum State Analysis

Density Matrix Visualization: Full quantum state characterization
Entanglement Entropy: Measure quantum correlations
Partial Traces: Reduced density matrices for subsystems
Observable Expectations: Pauli operators and custom measurements

Educational Tools

Step-by-Step Explanations: What each gate does mathematically
Gate Matrix Display: Show underlying unitary operations
Quantum Mechanics Principles: Built-in educational content
Interactive Tutorials: Guided quantum algorithm implementations

🐛 Known Issues & Roadmap
Current Limitations

Multi-qubit gate placement: UI could be more intuitive
Circuit depth: Performance degrades with very deep circuits
Custom gates: Limited support for user-defined operations

Upcoming Features

 Visual Circuit Editor: Drag-and-drop multi-qubit gate placement
 Noise Simulation: Realistic quantum hardware modeling
 Circuit Optimization: Automatic gate sequence optimization
 Collaborative Editing: Real-time collaboration features
 Mobile App: Native iOS and Android applications

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.