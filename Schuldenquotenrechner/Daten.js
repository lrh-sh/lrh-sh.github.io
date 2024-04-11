// definiere historische Zeitreihen für S-H
const histdata = {
    Jahr: [1950,1951,1952,1953,1954,1955,1956,1957,1958,1959,1960,1961,1962,1963,1964,1965,1966,1967,1968,1969,1970,1971,1972,1973,1974,1975,1976,1977,1978,1979,1980,1981,1982,1983,1984,1985,1986,1987,1988,1989,1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023],
    Schuldenquote: [14.22,16.16,15.41,18.55,20.28,20.00,19.50,18.33,16.25,16.69,17.13,15.10,13.19,12.66,12.31,12.25,12.26,12.80,12.91,12.15,11.50,10.84,11.43,11.09,11.23,12.91,14.14,14.47,15.19,15.24,16.09,17.64,19.12,20.09,20.81,21.36,21.32,22.73,22.96,22.50,21.83,21.06,20.95,22.23,22.35,22.96,23.69,24.31,24.65,24.95,25.10,25.36,27.35,29.10,29.96,31.73,31.97,31.56,31.04,34.44,35.65,35.54,34.65,33.40,32.71,31.78,30.20,28.04,29.56,28.66,30.06,29.95,27.44,25.86],
    ZinsSteuerQuote: [null,7.85,11.79,16.27,20.03,23.01,22.15,18.71,14.83,11.35,7.45,6.42,6.52,7.04,7.32,9.20,9.29,10.36,9.53,5.97,4.86,5.49,5.46,6.22,6.47,7.72,9.16,9.80,9.42,9.52,9.13,12.13,14.10,15.03,14.93,15.31,14.94,14.49,14.67,14.50,14.68,14.92,15.32,16.25,16.57,16.10,16.45,17.03,16.82,16.25,15.70,16.89,16.74,16.82,16.76,16.61,15.36,14.58,13.78,14.77,14.40,13.52,12.12,10.51,9.86,7.66,6.33,5.04,4.51,3.69,3.90,3.35,2.67,3.48],
    AusgabespielraumQuote: [null,188.63,119.03,185.66,147.01,114.16,114.98,96.01,70.33,115.24,134.10,95.78,97.49,96.99,99.47,107.54,100.27,98.75,101.49,97.36,110.56,105.91,113.45,107.50,111.34,115.85,112.04,106.53,101.65,104.60,116.08,106.36,104.10,105.23,99.56,100.53,99.10,100.95,98.87,96.22,97.32,96.78,97.21,96.77,95.82,97.68,94.29,91.91,93.92,93.94,97.91,94.19,102.58,103.60,95.86,105.85,99.88,98.70,100.19,99.36,102.02,91.62,90.14,88.53,88.26,92.06,92.50,95.44,90.89,97.47,93.63,93.73,95.79,99.95],
}

// definiere Startwerte
// todo: berechne aus Input-Daten
const b0 = 26.07; // Schuldenquote 2023 mit überschlägigem BIP-SH
const r0 = 3.06; // durchschn. Umlaufsrendite Bundesländer RLZ 9-10J in 2023
const i0 = 1.38; // durchschn. Verzinsung SH-Schulden 2023
const tyr= 10.77;// durchschn. Zins-Steuer-Quote 2015 - 2023
const T0 = 2023;
const nobs= 74 // Anzahl historischer Beobachtungen

// definiere technische Simulationsparameter
// todo: baue "Expertenmodus" ein, in dem diese Parms auch geändert werden können
const g_sd = 2.2 // Standardabweichung nominales Wachstum 91-23 in %
const g_se = 0.4 // Standardfehler des mittleren nominalen Wachstums SH 91-23 in %
const x_sd = 0.5 // Standardabweichung der Notkredit-Höhe in % des BIP
const LZ = 15    // Laufzeit Refinanzierung (Annahme: nur ein Laufzeitband)

// parse data in a format that is digestible by dygraph
const histdat1 = Array(nobs);
for (let i=0; i<nobs; i++) {
  histdat1[i] = [histdata.Jahr[i], 
                [null, histdata.Schuldenquote[i], null], // null und null sind lower / upper bounds
                [null, null, null] // Platzhalter für Sample
               ]
}
const histdat2 = Array(nobs);
for (let i=0; i<nobs; i++) {
  histdat2[i] = [histdata.Jahr[i], 
                [null, histdata.ZinsSteuerQuote[i], null] // null und null sind lower / upper bounds
                [null, null, null], // Platzhalter für Sample
               ]
}
