// functions to generate random variables
// 
// Robert Aue, 26.03.2024

function randomNormal(mean=0, sd=1) {
    // random normal variables using the Box-Muller transformation
    // see https://s3.amazonaws.com/nrbook.com/book_C210.html
    // and https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform#Polar_form
    // and https://stackoverflow.com/questions/1535631/static-variables-in-javascript

    let fac,rsq,v1,v2;
    
    // Check to see if the counter has been initialized
    // move this outside function lest it performs this Check
    // everytime it is called?
    if ( typeof randomNormal.iset == 'undefined' ) {
        // It has not... perform the initialization
        randomNormal.iset = 0;
    }

    if (randomNormal.iset === 1) {
        randomNormal.iset = 0;
        return mean + sd*randomNormal.gset;
    } else {
        do {
            v1 = 2.0*Math.random() - 1.0;
            v2 = 2.0*Math.random() - 1.0;
            rsq = v1*v1 + v2*v2;
        } while (rsq >= 1.0 || rsq === 0.0)
        fac = Math.sqrt(-2.0*Math.log(rsq)/rsq);
        randomNormal.gset = v1*fac;
        randomNormal.iset = 1;
        return mean + sd*v2*fac;
    }
}

function randomLogistic(mean=0, sd=1) {
    // variance of logistic deviate is s^2*pi^2/3 where s is the scale
    // parameter, so need to compute s first given a standard devivation.
    // siehe https://en.wikipedia.org/wiki/Logistic_distribution
    // but this is not faster than the Box-Muller implementation above
    
    const sd2s = 1.7320508075689 / Math.PI;
    let s = sd * sd2s;
    let p = Math.random();
    // uniform on [0,1)
    return mean + s * Math.log(p / (1 - p))
}

function randomLogLogistic(alpha = 1, beta=3) {
    // https://en.wikipedia.org/wiki/Log-logistic_distribution
    // can be used as drop-in replacement for LogNormal distribution
    // (much quicker)
    
    let p = Math.random();
    return alpha * Math.pow(p / (1 - p), 1/beta);
}

perfTest = function(n=100, fn) {
    var x = 0;
    var startTime = performance.now()

    for (let i=1; i<=n; i++) {
        x += fn(); // do something with the result to prevent a compiler optimizing the function call away
    }
    
    var endTime = performance.now()
    
    console.log(`${n} calls took ${endTime - startTime} milliseconds in total`)
    console.log(`Each call took ${(endTime - startTime)/n} milliseconds per execution`)
    console.log(`Mean(x) = ${x/n}`)
}

testRNG = function(n=100, fn, ...parms) {
    var x = 0;
    var x_sum = 0;
    var x2_sum= 0;
    var x_mean, x_sd;
    var x_max=-Infinity, x_min=+Infinity;
    console.log(arguments.length);
    console.log(parms.length);
        
    for (let i=1; i<=n; i++) {
        x = (parms.length===2) ? fn(parms[0], parms[1]) : fn();
        x_sum += x;
        x2_sum += x**2;
        x_max = Math.max(x_max, x);
        x_min = Math.min(x_min, x)
    }

    x_mean = x_sum/n;
    x_sd = Math.sqrt(x2_sum/n - x_mean**2);

    console.log(`Mean(x) = ${x_mean}`);
    console.log(`S.D.(x) = ${x_sd}`);
    console.log(`Min(x)  = ${x_min}`);
    console.log(`Max(x)  = ${x_max}`);
}

testRNG(n=1000000, randomNormal);
testRNG(n=1000000, randomNormal, .028, .022);

export {randomNormal, randomLogistic, randomLogLogistic};