import testResult from './MonteCarloSim.js';

function App() {
    var out = document.getElementById('test_output');
    var res = testResult();
    console.log("Hello from App()!")
    out.value = res.lrss;
    return 0;
}

export default App;