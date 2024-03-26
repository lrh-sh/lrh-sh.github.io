// Monte Carlo Simulation of the debt-to-gdp and interest-to-tax ratios
//
// Robert Aue, 25.03.2024
// 
// Note: disturbances are assumed to follow the logistic distribution
// to gain computational speed. It could be changed to random normal
// deviates late on.

import {randomNormal} from './RandomDistributions.js';


function oneSim(b0=28, g_mean=2.8, g_sd=2.2, g_se=0, d=0, 
                x_prob=0.2, x_mean=0.5, x_sd=0.5, K=40,
                i0=1.38, r0=3.0, r_bar=3.0, mat=15, tyr=10.75, 
                TT=30) {
    // Parameter
    // b0       Schuldenquote in t0 in % des BIP
    // g_mean   mittlere NOMINALE Wachstumsrate in % p.a.
    // g_sd     Standardabweichung der Wachstumsrate in % p.a.
    // g_se     Standardfehler der mittleren Wachstumsrate (=Parameterunsicherheit über g_mean)
    // d        reguläre Defizitgrenze in % des BIP (wird annahmegemäß voll ausgeschöpft)
    // x_prob   W'keit für Notkredit [0,1]
    // x_mean   mittlerer Notkredit in % des BIP
    // x_sd     Standardabweichung der Notkredit-Höhe in % des BIP
    // K        Tilgungsdauer Notkredit
    // i0       Durchschnittszins auf bestehenden Schuldenstand in t0
    // r0       Marktzins NOMINAL in t0
    // r_bar    Erwartungswert Marktzins
    // mat      Refinanzierungs-Laufzeit
    // tyr      Zins-Steuer-Quote (annahmegemäß konstant)
    // Tt       Zeithorizont für Simulation

    // Variablen definieren
    var Yt; // nominales BIP
    var lnx_mu; // Hilfsvariablen für logNormalVert
    var lnx_sd;
    var xt; // Notkredit als Anteil des BIP]
    var Xt; // Notkredite als numéraire
    var Xt_cum; // kumulierte Notkredite in numéraire
    var Xt_cum_arr = Array(TT); // Sammler
    var Tilgung_t; // Notkredit-Tilgung in t
    var Bt; // nominaler Schuldenstand
    var bt = Array(TT); // Schuldenquote in % des BIP
    var itr = Array(TT); // Zins-Steuer-Quote in %
    var rt; // Marktzins in %
    var it; // Durchschnittszins in %
    const a1 = 0.9483; // parameter für AR(1) Prozess des Marktzinses
    const a0 = r_bar * (1-a1); // parameter für AR(1) Prozess
    const eps_sd = 0.71888; // S.D. des Fehlerterms im AR(1) Modell des Marktzinses

    // transform some percentages to fractions
    b0 = b0 / 100;
    g_mean = g_mean / 100;
    g_sd = g_sd / 100;
    g_se = g_se / 100;
    d = d / 100;
    x_mean = x_mean / 100;
    x_sd = x_sd / 100;

    // initialize some time-dependent variables
    Yt = 100;
    xt = 0;
    Xt_cum = 0; // man könnte hier auch den existierenden Notkredit mit einbeziehen
    Bt = b0 * Yt;
    rt = r0;
    it = i0;
    

    // if g_se>0, draw mean growth rate to account for parameter uncertainty
    if (g_se > 0) {
        g_mean = randomNormal(mean = g_mean, sd = g_se);
    }

    // choose parameters of the Log-Normal distribution für die Notkredite
    if (x_mean>0) {
        // see https://en.wikipedia.org/wiki/Log-normal_distribution
        lnx_mu = Math.log( x_mean**2 / Math.sqrt( x_mean**2 + x_sd**2 ) );
        lnx_sd = Math.sqrt( Math.log( 1 + x_sd**2/x_mean**2 ) );
        console.log(`lnx_mu = ${lnx_mu}`);
        console.log(`lnx_sd = ${lnx_sd}`);
    }
    console.log(`Y0 = ${Yt}`);
    console.log(`g_mean = ${g_mean}, g_sd = ${g_sd}`);
    
    // simulate through time - time index starts at 0 here so actual time is t+1
    var gt;
    for (let t = 0; t < TT; t++) {
                
        // nominales BIP
        gt = randomNormal(mean = g_mean, sd = g_sd);
        Yt *= (1 + gt);
        console.log(`g${t} = ${gt}, Y${t} = ${Yt}`);

        
        
        // Zins-Steuer-Quote
        
        // da Durchschnittszins sich auf Bt-1 bezieht, berechne Zins-Steuer-Quote
        // zuerst, bevor, Bt und it aktualisiert werden
        itr[t] = Bt*it / (Yt*tyr) * 100; // = Bt * it / 100 / (Yt*tyr/100) * 100
        
        // sehr einfaches Modell für Markt- und Durchschnittszins (beide in %, d.h. 3.0%)
        rt = a0 + a1*rt + randomNormal(mean=0, sd=eps_sd);
        it = (1*rt + (mat-1)*it)/mat;

        
        
        // Schuldenquote
        
        // Notkredit
        xt = (x_mean>0 && Math.random()<=x_prob) ? Math.exp(randomNormal(lnx_mu, lnx_sd)) : 0.0;
        Xt = xt*Yt;

        // Notkredit-Tilgungen (uniform über einen Zeitraum von K Jahren)
        Tilgung_t = (Xt_cum - ((t>=K) ? Xt_cum_arr[t-K] : 0))/K

        // Notkredit-Buchhaltung
        Xt_cum += Xt;
        Xt_cum_arr[t] = Xt_cum;

        // Bewegungsgeleichung nominaler Schuldenstand mit NK und Tilgung
        Bt += d*Yt + Xt - Tilgung_t;
        bt[t] = Bt / Yt * 100;
    }

    // return both results as an object
    return {
        Schuldenquote: bt,
        ZinsSteuerQuote: itr
    }
}


function longRunSS(g_mean = 2.8, deficit = 0, x_prob = 0.2, x_mean = 1.0, K = 40) {
    // berechne den long run steady state
    var g = g_mean/100;
    var d = deficit / 100;
    var x = x_mean/100;

    return (1+g)/g * ( d + x_prob*x * ( 1 - (1 - (1+g)**(-K))/(g*K)) ) * 100
}



// einige Tests
function testResult() {
    var oneResult = oneSim(b0=28, g_mean=2.8, g_sd=2.2, g_se=0, d=0.15, 
                           x_prob=0.2, x_mean=0.5, x_sd=0.5, K=40,
                           i0=1.38, r0=3.0, r_bar=3.0, mat=15, tyr=10.75, 
                           TT=10)
    var lrss = longRunSS(g_mean = 2.8, deficit = .15, x_prob = .2, x_mean = 1.0, K=40)

    console.log(`Long run steady state: ${lrss}`);
    console.log(`Schuldenquote: ${oneResult.Schuldenquote}`);
    console.log(`Schuldenquote: ${oneResult.ZinsSteuerQuote}`);

    return {
        oneMSsim: oneResult,
        lrss: lrss
    }
}
    

export default testResult;