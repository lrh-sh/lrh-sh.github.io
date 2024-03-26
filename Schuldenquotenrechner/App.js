import testResult from './MonteCarloSim.js';

console.log("Hello from App.js!")

function App() {
    console.log("Hello from App()!")
    var out = document.getElementById('test_output');
    var res = testResult();
    out.innerHTML = `Long run steady state: ${res.lrss}<br>Schuldenquote: ${res.oneMSsim.Schuldenquote}<br>Zins-Steuer-Quote: ${res.oneMSsim.ZinsSteuerQuote}`;
    return 0;
}

App();

export default App;