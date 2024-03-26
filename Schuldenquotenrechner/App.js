import testResult from './MonteCarloSim.js';

console.log("Hello from App.js!")

function updateSimulation() {
    console.log("Hello from updateSimulation()!")
    var out = document.getElementById('test_output');
    var res = testResult();
    out.innerHTML = `Long run steady state: ${res.lrss.toFixed(2)}%<br>Schuldenquote: ${res.oneMSsim.Schuldenquote}<br>Zins-Steuer-Quote: ${res.oneMSsim.ZinsSteuerQuote}`;
}

console.log("updateSimulation() again")
updateSimulation();
console.log(".. and again")
updateSimulation();


function App() {
    console.log("Hello from App()!")
    document.getElementById('regular_deficit').addEventListener('input', updateSimulation())
    return 0;
}

App();

export default App;