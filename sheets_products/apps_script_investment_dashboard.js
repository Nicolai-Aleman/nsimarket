/**
 * ═══════════════════════════════════════════════════════════════
 * PORTFOLIO INVESTMENT DASHBOARD - No Somos Ignorantes
 * Markowitz Portfolio Analysis with GOOGLEFINANCE
 * ═══════════════════════════════════════════════════════════════
 *
 * LOCALE: Spanish (semicolons as argument separators).
 * If English locale: replace all ; with , in formulas.
 *
 * HOW TO USE:
 * 1. Open your Google Sheet
 * 2. Extensions → Apps Script
 * 3. Paste this entire code (replace any existing code)
 * 4. Click Run → crearDashboardInversion
 * 5. Authorize when prompted
 * 6. Wait ~30 seconds for setup to complete
 * 7. Enter stock tickers in the Inputs tab (e.g. NASDAQ:AAPL)
 */

// ============ CONFIGURATION ============
var NUM_STOCKS = 10;
var SR = 9;  // Stock data start row in Inputs

// ============ MAIN FUNCTION ============
function crearDashboardInversion() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var S = {
    headerBg:  '#EFEFEF',
    inputBg:   '#FFF2CC',
    weightBg:  '#D9D9D9',
    passedBg:  '#D9EAD3',
    failedBg:  '#F4CCCC',
    matrixHi:  '#D9EAD3',
    matrixLo:  '#F4CCCC',
    accentBg:  '#4472C4',
    font:      'Arial'
  };

  // Create or reset sheets
  var names = [
    'Instructions', 'Inputs', 'Data Calculation',
    'Correlation Charts', 'Historical Price Charts', 'Return Distributions'
  ];
  names.forEach(function(name) {
    var sh = ss.getSheetByName(name);
    if (sh) {
      sh.clear();
      sh.clearConditionalFormatRules();
      sh.getCharts().forEach(function(c) { sh.removeChart(c); });
    } else {
      ss.insertSheet(name);
    }
  });

  // Remove default empty sheets
  ['Hoja 1', 'Sheet1'].forEach(function(n) {
    var sh = ss.getSheetByName(n);
    if (sh && sh.getLastRow() === 0) { try { ss.deleteSheet(sh); } catch(e) {} }
  });

  // Build each tab
  buildInputs(ss, S);
  buildDataEngine(ss, S);
  buildCorrelation(ss, S);
  buildHistorical(ss, S);
  buildDistributions(ss, S);
  buildInstructions(ss, S);

  ss.setActiveSheet(ss.getSheetByName('Inputs'));
  SpreadsheetApp.flush();
  ss.toast('Dashboard created successfully! Check all tabs.', 'Success', 5);
}

// ============ HELPER ============
function CL(n) {
  var s = '';
  while (n > 0) { var m = (n-1) % 26; s = String.fromCharCode(65+m) + s; n = Math.floor((n-1)/26); }
  return s;
}

// ══════════════════════════════════════
// INPUTS SHEET
// ══════════════════════════════════════
function buildInputs(ss, S) {
  var ws = ss.getSheetByName('Inputs');
  ws.setHiddenGridlines(true);
  ws.setTabColor('#FF0000');

  // Column widths
  var widths = [20, 200, 120, 100, 130, 120, 100, 130, 120, 100, 20, 130, 130, 130];
  widths.forEach(function(w, i) { ws.setColumnWidth(i+1, w); });

  // ---- LICENSE ----
  ws.getRange('B1:J1').merge()
    .setValue('LICENSED USE ONLY - DO NOT SHARE. This dashboard is licensed for single-user personal use.')
    .setFontSize(8).setFontStyle('italic').setFontColor('#999999');

  // ---- CONFIGURATION ----
  ws.getRange('B3').setValue('Duration (Years)').setFontWeight('bold');
  ws.getRange('C3').setValue(10).setHorizontalAlignment('center')
    .setBackground(S.inputBg).setBorder(true,true,true,true,null,null);

  ws.getRange('B4').setValue('Start and End Date').setFontWeight('bold');
  ws.getRange('C4').setFormula('=TEXT(EDATE(TODAY();-12*C3);"mm/dd/yyyy")&" to "&TEXT(TODAY();"mm/dd/yyyy")')
    .setFontStyle('italic').setFontSize(9);

  ws.getRange('B5').setValue('Risk-Free Rate (Rf)').setFontWeight('bold');
  ws.getRange('C5').setFormula('=IFERROR(GOOGLEFINANCE("INDEXCBOE:TNX")/1000;0,0435)')
    .setNumberFormat('0.00%').setBackground(S.headerBg);

  // Title & Screener Goals (right side)
  ws.getRange('E3:H3').merge().setValue('10 Year = Company Foundation')
    .setFontSize(14).setFontWeight('bold').setHorizontalAlignment('center');
  ws.getRange('E4').setValue('Stock Screener Goals:').setFontWeight('bold');
  ws.getRange('E5').setValue('  • Risk below 20%');
  ws.getRange('E6').setValue('  • Risk-Adjusted Returns above 1.0');

  // Color Key
  ws.getRange('I4').setValue('Color Key:').setFontWeight('bold');
  ws.getRange('J4').setValue('Passed').setBackground(S.passedBg)
    .setHorizontalAlignment('center').setBorder(true,true,true,true,null,null);
  ws.getRange('J5').setValue('Failed').setBackground(S.failedBg)
    .setHorizontalAlignment('center').setBorder(true,true,true,true,null,null);

  // ---- TABLE HEADERS ----
  var hRow = 8;
  var hdrs = ['Company','Symbol','Initial\nWeights','Market Cap\n(Billions USD)',
              'Annualized\nReturn','Risk','Risk-Adjusted\nReturn','Sector','Min Return'];
  ws.getRange(hRow, 2, 1, 9).setValues([hdrs])
    .setBackground(S.headerBg).setFontWeight('bold').setHorizontalAlignment('center')
    .setVerticalAlignment('middle').setWrap(true)
    .setBorder(null,null,true,null,null,null,'black',SpreadsheetApp.BorderStyle.SOLID_THICK);
  ws.setRowHeight(hRow, 45);

  // ---- STOCK DATA ROWS ----
  for (var i = 0; i < NUM_STOCKS; i++) {
    var r = SR + i;
    var t = 'C' + r;
    var dc = CL(2 + i); // Data Calc column for this stock

    // B: Company name (auto)
    ws.getRange(r, 2).setFormula('=IFERROR(GOOGLEFINANCE(' + t + ';"name");"")');

    // C: Symbol (user input - yellow)
    ws.getRange(r, 3).setBackground(S.inputBg)
      .setBorder(true,true,true,true,null,null);

    // D: Weight (user input - gray)
    ws.getRange(r, 4).setBackground(S.weightBg).setNumberFormat('0%')
      .setHorizontalAlignment('center').setBorder(true,true,true,true,null,null);

    // E: Market Cap in billions (auto)
    ws.getRange(r, 5).setFormula('=IFERROR(GOOGLEFINANCE(' + t + ';"marketcap")/1000000000;"")')
      .setNumberFormat('$#,##0.0');

    // F: Annualized Return - reference last/first price from Data Calc
    ws.getRange(r, 6).setFormula(
      '=IF(' + t + '="";"";IFERROR(' +
      'LET(prices;\'Data Calculation\'!' + dc + '4:' + dc + '200;' +
      'n;COUNTA(prices);' +
      'p_end;INDEX(prices;n);' +
      'p_start;INDEX(prices;1);' +
      '(p_end/p_start)^(1/$C$3)-1);"N/A"))'
    ).setNumberFormat('0.0%').setBackground(S.passedBg);

    // G: Risk = annualized stdev of monthly returns from Data Calc
    ws.getRange(r, 7).setFormula(
      '=IF(' + t + '="";"";IFERROR(' +
      'STDEV(\'Data Calculation\'!' + dc + '205:' + dc + '400)*SQRT(12);"N/A"))'
    ).setNumberFormat('0.0%').setBackground(S.passedBg);

    // H: Sharpe Ratio = (Return - Rf) / Risk
    ws.getRange(r, 8).setFormula(
      '=IF(' + t + '="";"";IFERROR((F' + r + '-$C$5)/G' + r + ';""))'
    ).setNumberFormat('0.00').setBackground(S.passedBg);

    // I: Sector (user input)
    ws.getRange(r, 9).setBackground('#F3F3F3');

    // J: Min monthly return
    ws.getRange(r, 10).setFormula(
      '=IF(' + t + '="";"";IFERROR(MIN(\'Data Calculation\'!' + dc + '205:' + dc + '400);"N/A"))'
    ).setNumberFormat('0.0%');
  }

  // ---- WEIGHT VALIDATION ----
  var weightRow = SR + NUM_STOCKS;
  ws.getRange(weightRow, 4).setFormula('=SUM(D' + SR + ':D' + (SR+NUM_STOCKS-1) + ')')
    .setNumberFormat('0.00%').setFontWeight('bold');
  ws.getRange(weightRow, 5).setFormula(
    '=IF(D' + weightRow + '=1;"";' +
    '"<-- Portfolio weight must equal 100% off by "&TEXT(1-D' + weightRow + ';"0.0%"))'
  ).setFontColor('red').setFontWeight('bold');

  // ---- CONDITIONAL FORMATTING (Pass/Fail) ----
  var riskRange = ws.getRange(SR, 7, NUM_STOCKS, 1);
  var sharpeRange = ws.getRange(SR, 8, NUM_STOCKS, 1);

  var rules = [
    SpreadsheetApp.newConditionalFormatRule()
      .whenNumberGreaterThan(0.20).setBackground(S.failedBg)
      .setRanges([riskRange]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenNumberLessThanOrEqualTo(0.20).setBackground(S.passedBg)
      .setRanges([riskRange]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenNumberLessThan(1.0).setBackground(S.failedBg)
      .setRanges([sharpeRange]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenNumberGreaterThanOrEqualTo(1.0).setBackground(S.passedBg)
      .setRanges([sharpeRange]).build()
  ];
  ws.setConditionalFormatRules(rules);

  // ---- PORTFOLIO VS BENCHMARKS ----
  var cr = weightRow + 2; // comparison row start
  ws.getRange(cr, 2).setValue('Sample Portfolio vs. Benchmarks')
    .setFontSize(12).setFontWeight('bold');

  // Headers
  ws.getRange(cr+1, 5).setValue('Sample\nPortfolio').setBackground(S.headerBg)
    .setFontWeight('bold').setHorizontalAlignment('center').setWrap(true);
  ws.getRange(cr+1, 6).setValue('S&P 500\n(SPY)').setBackground(S.headerBg)
    .setFontWeight('bold').setHorizontalAlignment('center').setWrap(true);
  ws.getRange(cr+1, 7).setValue('NASDAQ-100\n(QQQ)').setBackground(S.headerBg)
    .setFontWeight('bold').setHorizontalAlignment('center').setWrap(true);
  ws.getRange(cr+1, 8).setValue('Dow Jones\n(DIA)').setBackground(S.headerBg)
    .setFontWeight('bold').setHorizontalAlignment('center').setWrap(true);

  // Labels
  ws.getRange(cr+2, 2).setValue('Annualized Return').setFontWeight('bold');
  ws.getRange(cr+3, 2).setValue('Risk').setFontWeight('bold');
  ws.getRange(cr+4, 2).setValue('Risk-Adjusted Return').setFontWeight('bold');

  // Portfolio metrics
  ws.getRange(cr+2, 5).setFormula('=SUMPRODUCT(D'+SR+':D'+(SR+NUM_STOCKS-1)+';F'+SR+':F'+(SR+NUM_STOCKS-1)+')')
    .setNumberFormat('0.0%').setBackground(S.passedBg);

  // Portfolio Risk using covariance matrix (true Markowitz)
  // Covariance matrix location: row (422+NUM_STOCKS+3) to (422+2*NUM_STOCKS+2)
  var covRow1 = 422 + NUM_STOCKS + 3;
  var covRow2 = covRow1 + NUM_STOCKS - 1;
  var covColEnd = CL(1 + NUM_STOCKS);
  ws.getRange(cr+3, 5).setFormula(
    '=IFERROR(SQRT(INDEX(MMULT(MMULT(TRANSPOSE(D'+SR+':D'+(SR+NUM_STOCKS-1)+');' +
    '\'Data Calculation\'!B' + covRow1 + ':' + covColEnd + covRow2 + ');' +
    'D'+SR+':D'+(SR+NUM_STOCKS-1)+');1;1)*12);"N/A")'
  ).setNumberFormat('0.0%').setBackground(S.passedBg);

  ws.getRange(cr+4, 5).setFormula('=IFERROR((E'+(cr+2)+'-$C$5)/E'+(cr+3)+';0)')
    .setNumberFormat('0.00').setBorder(true,true,true,true,null,null);

  // Benchmark formulas (SPY, QQQ, DIA)
  var benchmarks = ['"NYSEARCA:SPY"', '"NASDAQ:QQQ"', '"NYSEARCA:DIA"'];
  for (var b = 0; b < 3; b++) {
    var col = 6 + b;
    var bk = benchmarks[b];

    // Annualized Return
    ws.getRange(cr+2, col).setFormula(
      '=IFERROR((GOOGLEFINANCE('+bk+';"price")/INDEX(GOOGLEFINANCE('+bk+';"price";EDATE(TODAY();-12*$C$3));2;2))^(1/$C$3)-1;"")'
    ).setNumberFormat('0.0%');

    // Risk (annualized stdev of monthly returns)
    ws.getRange(cr+3, col).setFormula(
      '=IFERROR(LET(data;GOOGLEFINANCE('+bk+';"price";EDATE(TODAY();-12*$C$3);TODAY();"MONTHLY");'+
      'n;ROWS(data);'+
      'curr;INDEX(data;SEQUENCE(n-2;1;3);2);'+
      'prev;INDEX(data;SEQUENCE(n-2;1;2);2);'+
      'rets;(curr-prev)/prev;'+
      'STDEV(rets)*SQRT(12));"")'
    ).setNumberFormat('0.0%');

    // Sharpe
    ws.getRange(cr+4, col).setFormula(
      '=IFERROR(('+CL(col)+(cr+2)+'-$C$5)/'+CL(col)+(cr+3)+';0)'
    ).setNumberFormat('0.00');
  }

  // ---- HOW MANY TIMES STRONGER ----
  var hx = cr + 6;
  ws.getRange(hx, 2).setValue('How many times stronger was this\nSample Portfolio than S&P 500\n(based on Risk-Adjusted Return)?')
    .setFontStyle('italic').setWrap(true);

  var box = ws.getRange(hx, 5, 2, 2);
  box.merge().setBackground(S.weightBg).setHorizontalAlignment('center')
    .setVerticalAlignment('middle').setFontSize(24).setFontWeight('bold');
  box.setFormula('=IFERROR(ROUND(E'+(cr+4)+'/F'+(cr+4)+';1)&"x";"N/A")');

  // ---- SECTOR PIE CHART ----
  var chart = ws.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(ws.getRange('I'+SR+':I'+(SR+NUM_STOCKS-1)))
    .addRange(ws.getRange('D'+SR+':D'+(SR+NUM_STOCKS-1)))
    .setPosition(cr+1, 9, 0, 0)
    .setOption('title', 'Sample Portfolio Sector Breakdown')
    .setOption('pieSliceText', 'percentage')
    .setOption('width', 450)
    .setOption('height', 350)
    .build();
  ws.insertChart(chart);
}

// ══════════════════════════════════════
// DATA CALCULATION SHEET (Engine)
// ══════════════════════════════════════
function buildDataEngine(ss, S) {
  var ws = ss.getSheetByName('Data Calculation');
  ws.setTabColor('black');

  // ---- SECTION 1: MONTHLY PRICES (Rows 1-200) ----
  ws.getRange('A1').setValue('MONTHLY PRICE DATA').setFontWeight('bold').setFontSize(11);

  // Row 2: Headers
  ws.getRange('A2').setValue('Date').setFontWeight('bold');
  for (var i = 0; i < NUM_STOCKS; i++) {
    ws.getRange(2, 2+i).setFormula('=Inputs!C' + (SR+i)).setFontWeight('bold');
  }

  // Row 3: GOOGLEFINANCE header row ("Date","Close") — row 4+ = actual data
  // Stock 1: full array (dates + prices) in A3
  ws.getRange('A3').setFormula(
    '=IF(Inputs!C'+SR+'="";"";GOOGLEFINANCE(Inputs!C'+SR+';"price";EDATE(TODAY();-12*Inputs!C3);TODAY();"MONTHLY"))'
  );

  // Stocks 2-10: prices only — skip header row, place data at row 4
  for (var i = 1; i < NUM_STOCKS; i++) {
    var tickerRef = 'Inputs!C' + (SR + i);
    ws.getRange(4, 2+i).setFormula(
      '=IF(' + tickerRef + '="";"";IFERROR(' +
      'LET(d;GOOGLEFINANCE(' + tickerRef + ';"price";EDATE(TODAY();-12*Inputs!C3);TODAY();"MONTHLY");' +
      'n;ROWS(d)-1;' +
      'ARRAYFORMULA(INDEX(d;SEQUENCE(n;1;2);2)));' +
      '""))'
    );
  }

  // ---- SECTION 2: MONTHLY RETURNS (Rows 202-400) ----
  ws.getRange('A202').setValue('MONTHLY RETURNS').setFontWeight('bold').setFontSize(11);
  ws.getRange('A203').setValue('Date').setFontWeight('bold');
  for (var i = 0; i < NUM_STOCKS; i++) {
    ws.getRange(203, 2+i).setFormula('=Inputs!C' + (SR+i)).setFontWeight('bold');
  }

  // Returns = (P_t - P_{t-1}) / P_{t-1} using ARRAYFORMULA
  for (var i = 0; i < NUM_STOCKS; i++) {
    var c = CL(2 + i); // B, C, D, ...
    // Dates (copy from prices section)
    if (i === 0) {
      ws.getRange('A204').setFormula('=ARRAYFORMULA(IF(A5:A200="";"";A5:A200))');
    }
    // Returns: (price_t - price_{t-1}) / price_{t-1}, skip header at row 3
    ws.getRange(204, 2+i).setFormula(
      '=ARRAYFORMULA(IF(' + c + '5:' + c + '200="";"";(' + c + '5:' + c + '200-' + c + '4:' + c + '199)/' + c + '4:' + c + '199))'
    );
  }

  // ---- SECTION 3: STATISTICS (Row 410) ----
  ws.getRange('A410').setValue('STATISTICS').setFontWeight('bold').setFontSize(11);
  var statLabels = ['Mean Monthly Return', 'Stdev Monthly', 'Annualized Return (CAGR)',
                    'Annualized Risk', 'Sharpe Ratio', 'Min Monthly Return', 'Max Monthly Return'];
  for (var s = 0; s < statLabels.length; s++) {
    ws.getRange(411 + s, 1).setValue(statLabels[s]).setFontWeight('bold');
  }

  for (var i = 0; i < NUM_STOCKS; i++) {
    var c = CL(2 + i);
    var retRange = c + '205:' + c + '400';
    var priceRange = c + '4:' + c + '200';

    // Mean monthly return
    ws.getRange(411, 2+i).setFormula('=IFERROR(AVERAGE(' + retRange + ');"")').setNumberFormat('0.00%');
    // Stdev monthly
    ws.getRange(412, 2+i).setFormula('=IFERROR(STDEV(' + retRange + ');"")').setNumberFormat('0.00%');
    // CAGR
    ws.getRange(413, 2+i).setFormula(
      '=IFERROR(LET(p;' + priceRange + ';n;COUNTA(p);(INDEX(p;n)/INDEX(p;1))^(1/Inputs!C3)-1);"")'
    ).setNumberFormat('0.00%');
    // Annualized risk
    ws.getRange(414, 2+i).setFormula('=IFERROR(' + CL(2+i) + '412*SQRT(12);"")').setNumberFormat('0.00%');
    // Sharpe
    ws.getRange(415, 2+i).setFormula('=IFERROR((' + CL(2+i) + '413-Inputs!C5)/' + CL(2+i) + '414;"")').setNumberFormat('0.00');
    // Min return
    ws.getRange(416, 2+i).setFormula('=IFERROR(MIN(' + retRange + ');"")').setNumberFormat('0.00%');
    // Max return
    ws.getRange(417, 2+i).setFormula('=IFERROR(MAX(' + retRange + ');"")').setNumberFormat('0.00%');
  }

  // ---- SECTION 4: CORRELATION MATRIX (Row 420) ----
  ws.getRange('A420').setValue('CORRELATION MATRIX').setFontWeight('bold').setFontSize(11);
  // Header row
  for (var i = 0; i < NUM_STOCKS; i++) {
    ws.getRange(421, 2+i).setFormula('=Inputs!C' + (SR+i)).setFontWeight('bold');
    ws.getRange(422+i, 1).setFormula('=Inputs!C' + (SR+i)).setFontWeight('bold');
  }
  // Matrix values
  for (var r = 0; r < NUM_STOCKS; r++) {
    for (var c = 0; c < NUM_STOCKS; c++) {
      var rCol = CL(2+r);
      var cCol = CL(2+c);
      if (r === c) {
        ws.getRange(422+r, 2+c).setValue(1).setNumberFormat('0.00').setBackground('#DDDDDD');
      } else {
        ws.getRange(422+r, 2+c).setFormula(
          '=IFERROR(CORREL(' + rCol + '205:' + rCol + '400;' + cCol + '205:' + cCol + '400);0)'
        ).setNumberFormat('0.00');
      }
    }
  }

  // ---- SECTION 5: COVARIANCE MATRIX (Row 425 + NUM_STOCKS + 2) ----
  var covStart = 422 + NUM_STOCKS + 2;
  ws.getRange(covStart - 1, 1).setValue('COVARIANCE MATRIX (Monthly)').setFontWeight('bold').setFontSize(11);
  // Header row
  for (var i = 0; i < NUM_STOCKS; i++) {
    ws.getRange(covStart, 2+i).setFormula('=Inputs!C' + (SR+i)).setFontWeight('bold');
    ws.getRange(covStart+1+i, 1).setFormula('=Inputs!C' + (SR+i)).setFontWeight('bold');
  }
  // Matrix values
  for (var r = 0; r < NUM_STOCKS; r++) {
    for (var c = 0; c < NUM_STOCKS; c++) {
      var rCol = CL(2+r);
      var cCol = CL(2+c);
      ws.getRange(covStart+1+r, 2+c).setFormula(
        '=IFERROR(COVAR(' + rCol + '205:' + rCol + '400;' + cCol + '205:' + cCol + '400);0)'
      ).setNumberFormat('0.000000');
    }
  }

  // Store covStart reference for Inputs sheet
  // The covariance matrix is at rows (covStart+1) to (covStart+NUM_STOCKS), columns B to CL(1+NUM_STOCKS)
  // Inputs sheet references this for portfolio risk calculation
}

// ══════════════════════════════════════
// CORRELATION CHARTS SHEET
// ══════════════════════════════════════
function buildCorrelation(ss, S) {
  var ws = ss.getSheetByName('Correlation Charts');
  ws.setTabColor('blue');
  ws.setHiddenGridlines(true);

  // ---- TITLE ----
  ws.getRange('B2').setValue('Correlation Charts').setFontSize(16).setFontWeight('bold');
  ws.getRange('B3').setValue('Correlations of monthly returns, based on selected duration')
    .setFontStyle('italic').setFontColor('#666666');

  // ---- AVERAGE CORRELATION PER STOCK (for bar chart) ----
  ws.getRange('AA1').setValue('Stock');
  ws.getRange('AB1').setValue('Avg Correlation');
  for (var i = 0; i < NUM_STOCKS; i++) {
    ws.getRange(2+i, 27).setFormula('=Inputs!C' + (SR+i)); // AA column
    // Average correlation from the matrix (exclude self = 1.0)
    var matrixRow = 422 + i; // Row in Data Calculation correlation matrix
    ws.getRange(2+i, 28).setFormula(
      '=IF(AA' + (2+i) + '="";"";IFERROR(' +
      'AVERAGE(FILTER(\'Data Calculation\'!' + CL(2) + matrixRow + ':' + CL(1+NUM_STOCKS) + matrixRow +
      ';\'Data Calculation\'!' + CL(2) + matrixRow + ':' + CL(1+NUM_STOCKS) + matrixRow + '<>1));""))'
    );
  }

  // Bar chart
  var chartBar = ws.newChart()
    .setChartType(Charts.ChartType.BAR)
    .addRange(ws.getRange('AA1:AB' + (1+NUM_STOCKS)))
    .setPosition(5, 2, 0, 0)
    .setOption('title', 'Average Correlation by Asset')
    .setOption('legend', {position: 'none'})
    .setOption('colors', ['#4472C4'])
    .setOption('width', 700)
    .setOption('height', 400)
    .build();
  ws.insertChart(chartBar);

  // ---- FULL CORRELATION MATRIX (below chart) ----
  var mStart = 24;
  ws.getRange(mStart, 2).setValue('Correlation Matrix (Heatmap)')
    .setFontSize(14).setFontWeight('bold');

  // Headers
  for (var i = 0; i < NUM_STOCKS; i++) {
    ws.getRange(mStart+1, 3+i).setFormula('=Inputs!C' + (SR+i))
      .setFontWeight('bold').setHorizontalAlignment('center').setFontSize(8);
    ws.getRange(mStart+2+i, 2).setFormula('=Inputs!C' + (SR+i))
      .setFontWeight('bold').setFontSize(8);
  }

  // Matrix cells (reference Data Calculation correlation matrix)
  for (var r = 0; r < NUM_STOCKS; r++) {
    for (var c = 0; c < NUM_STOCKS; c++) {
      var cell = ws.getRange(mStart+2+r, 3+c);
      cell.setFormula("='Data Calculation'!" + CL(2+c) + (422+r));
      cell.setNumberFormat('0.00');
      if (r === c) cell.setBackground('#DDDDDD');
    }
  }

  // Heatmap conditional formatting
  var matRange = ws.getRange(mStart+2, 3, NUM_STOCKS, NUM_STOCKS);
  var rules = [
    SpreadsheetApp.newConditionalFormatRule()
      .whenNumberGreaterThan(0.6).setBackground(S.matrixHi).setRanges([matRange]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenNumberLessThan(0.3).setBackground(S.matrixLo).setRanges([matRange]).build()
  ];
  ws.setConditionalFormatRules(rules);
}

// ══════════════════════════════════════
// HISTORICAL PRICE CHARTS SHEET
// ══════════════════════════════════════
function buildHistorical(ss, S) {
  var ws = ss.getSheetByName('Historical Price Charts');
  ws.setTabColor('gray');
  ws.setHiddenGridlines(true);

  // ---- CONTROLS ----
  ws.getRange('B2').setValue('Historical Price Charts').setFontSize(16).setFontWeight('bold');
  ws.getRange('B3').setValue('Outputs - Normalized to Base 100').setFontStyle('italic');

  ws.getRange('B5').setValue('Select Time Range:').setFontWeight('bold');
  var dropdown = ws.getRange('C5');
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['1 Year','3 Years','5 Years','10 Years'], true).build();
  dropdown.setDataValidation(rule).setValue('10 Years')
    .setBackground(S.inputBg).setFontWeight('bold').setHorizontalAlignment('center');

  // Hidden helper: months to subtract
  ws.getRange('Z1').setFormula('=SWITCH(C5;"1 Year";12;"3 Years";36;"5 Years";60;"10 Years";120;120)');
  ws.getRange('Z2').setFormula('=EDATE(TODAY();-Z1)'); // Start date

  // ---- DATA TABLE ----
  ws.getRange('A7').setValue('Date').setFontWeight('bold');
  for (var i = 0; i < NUM_STOCKS; i++) {
    ws.getRange(7, 2+i).setFormula('=Inputs!C' + (SR+i)).setFontWeight('bold');
  }

  // Stock 1: full GOOGLEFINANCE array for dates + prices (header at row 8, data at row 9+)
  ws.getRange('A8').setFormula(
    '=IF(Inputs!C'+SR+'="";"";GOOGLEFINANCE(Inputs!C'+SR+';"price";Z2;TODAY();"MONTHLY"))'
  );

  // Stocks 2-10: prices only, skip header, place at row 9
  for (var i = 1; i < NUM_STOCKS; i++) {
    var tickerRef = 'Inputs!C' + (SR + i);
    ws.getRange(9, 2+i).setFormula(
      '=IF(' + tickerRef + '="";"";IFERROR(' +
      'LET(d;GOOGLEFINANCE(' + tickerRef + ';"price";Z2;TODAY();"MONTHLY");' +
      'n;ROWS(d)-1;' +
      'ARRAYFORMULA(INDEX(d;SEQUENCE(n;1;2);2)));' +
      '""))'
    );
  }

  // Normalized data starting at column N (14)
  var normStart = 14;
  ws.getRange(7, normStart).setValue('Date').setFontWeight('bold');
  for (var i = 0; i < NUM_STOCKS; i++) {
    ws.getRange(7, normStart+1+i).setFormula('=Inputs!C' + (SR+i)).setFontWeight('bold');
  }

  // Copy dates (skip header at row 8, data starts at row 9)
  ws.getRange(8, normStart).setFormula('=ARRAYFORMULA(IF(A9:A300="";"";A9:A300))');

  // Normalized prices (Base 100) for each stock — skip header row
  for (var i = 0; i < NUM_STOCKS; i++) {
    var priceCol = CL(2 + i); // B, C, D, ...
    var normCol = normStart + 1 + i;
    ws.getRange(8, normCol).setFormula(
      '=ARRAYFORMULA(IF(' + priceCol + '9:' + priceCol + '300="";"";' +
      priceCol + '9:' + priceCol + '300/INDEX(' + priceCol + '9:' + priceCol + '300;1)*100))'
    );
  }

  // ---- LINE CHART ----
  var chartRange = ws.getRange(7, normStart, 294, 1 + NUM_STOCKS);
  var chartHist = ws.newChart()
    .setChartType(Charts.ChartType.LINE)
    .addRange(chartRange)
    .setPosition(2, 5, 0, 0)
    .setOption('title', 'Historical Performance (Rebased to 100)')
    .setOption('curveType', 'function')
    .setOption('width', 900)
    .setOption('height', 500)
    .setOption('hAxis', {title: 'Date', format: 'MMM yyyy'})
    .setOption('vAxis', {title: 'Growth (Base 100)'})
    .setOption('interpolateNulls', true)
    .build();
  ws.insertChart(chartHist);
}

// ══════════════════════════════════════
// RETURN DISTRIBUTIONS SHEET
// ══════════════════════════════════════
function buildDistributions(ss, S) {
  var ws = ss.getSheetByName('Return Distributions');
  ws.setTabColor('purple');
  ws.setHiddenGridlines(true);

  ws.getRange('B1').setValue('Return Distribution Charts')
    .setFontSize(16).setFontWeight('bold');
  ws.getRange('B2').setValue('Monthly return frequency distributions')
    .setFontStyle('italic').setFontColor('#666666');

  // For each stock, create histogram data using FREQUENCY
  // Bins: -30% to +30% in 3% increments
  var bins = [];
  for (var b = -30; b <= 27; b += 3) { bins.push(b/100); }

  // Put bin edges in column A
  ws.getRange('A4').setValue('Bins').setFontWeight('bold');
  for (var b = 0; b < bins.length; b++) {
    ws.getRange(5+b, 1).setValue(bins[b]).setNumberFormat('0%');
  }

  // For each stock, put FREQUENCY results in adjacent columns
  for (var i = 0; i < NUM_STOCKS; i++) {
    var col = 2 + i;
    var dc = CL(2 + i); // Data Calculation returns column

    // Header
    ws.getRange(4, col).setFormula('=Inputs!C' + (SR+i)).setFontWeight('bold');

    // FREQUENCY formula
    ws.getRange(5, col).setFormula(
      '=IFERROR(FREQUENCY(\'Data Calculation\'!' + dc + '205:' + dc + '400;A5:A' + (4+bins.length) + ');"")'
    );
  }

  // Create histogram charts (2 per row, for first 6 stocks)
  var chartsPerRow = 2;
  for (var i = 0; i < Math.min(NUM_STOCKS, 6); i++) {
    var col = 2 + i;
    var chartRow = 5 + bins.length + 2 + Math.floor(i / chartsPerRow) * 18;
    var chartCol = 2 + (i % chartsPerRow) * 6;

    var titleFormula = ws.getRange(4, col).getDisplayValue() || ('Stock ' + (i+1));

    var chartDist = ws.newChart()
      .setChartType(Charts.ChartType.COLUMN)
      .addRange(ws.getRange('A4:A' + (4+bins.length)))
      .addRange(ws.getRange(4, col, bins.length+1, 1))
      .setPosition(chartRow, chartCol, 0, 0)
      .setOption('title', 'Monthly Return Distribution')
      .setOption('legend', {position: 'none'})
      .setOption('colors', ['#808080'])
      .setOption('width', 450)
      .setOption('height', 300)
      .setOption('hAxis', {title: 'Monthly Returns (%)'})
      .setOption('vAxis', {title: 'Frequency'})
      .build();
    ws.insertChart(chartDist);
  }
}

// ══════════════════════════════════════
// INSTRUCTIONS SHEET
// ══════════════════════════════════════
function buildInstructions(ss, S) {
  var ws = ss.getSheetByName('Instructions');
  ws.setTabColor('green');
  ws.setColumnWidth(1, 20);
  ws.setColumnWidth(2, 800);

  var instructions = [
    ['', ''],
    ['', 'INVESTMENT PORTFOLIO DASHBOARD - Instructions'],
    ['', ''],
    ['', 'HOW TO USE:'],
    ['', '1. Go to the "Inputs" tab'],
    ['', '2. Enter stock tickers in the Symbol column (yellow cells)'],
    ['', '   Format: EXCHANGE:TICKER (e.g., NASDAQ:AAPL, NYSE:JPM, NYSEARCA:SPY)'],
    ['', '3. Enter portfolio weights in the Weights column (must sum to 100%)'],
    ['', '4. Enter sector names for each stock (optional)'],
    ['', '5. All calculations update automatically via GOOGLEFINANCE'],
    ['', ''],
    ['', 'TABS OVERVIEW:'],
    ['', '• Inputs - Main dashboard with stock metrics and portfolio comparison'],
    ['', '• Data Calculation - Engine (monthly prices, returns, correlations)'],
    ['', '• Correlation Charts - Visual correlation analysis between assets'],
    ['', '• Historical Price Charts - Interactive normalized price charts'],
    ['', '• Return Distributions - Monthly return frequency histograms'],
    ['', ''],
    ['', 'KEY METRICS:'],
    ['', '• Annualized Return: CAGR over the selected duration'],
    ['', '• Risk: Annualized standard deviation of monthly returns'],
    ['', '• Risk-Adjusted Return: Sharpe Ratio = (Return - Risk-Free Rate) / Risk'],
    ['', '• Risk-Free Rate: Auto-updated from US 10-Year Treasury Bond yield'],
    ['', ''],
    ['', 'SCREENING CRITERIA:'],
    ['', '• Green = PASSED: Risk below 20% AND Sharpe Ratio above 1.0'],
    ['', '• Red = FAILED: Does not meet one or both criteria'],
    ['', ''],
    ['', 'BENCHMARKS:'],
    ['', '• S&P 500 (SPY) - Broad US market'],
    ['', '• NASDAQ-100 (QQQ) - Tech-heavy large cap'],
    ['', '• Dow Jones (DIA) - Blue-chip industrials'],
    ['', ''],
    ['', 'COMMON TICKER FORMATS:'],
    ['', '  NASDAQ:AAPL    Apple'],
    ['', '  NASDAQ:MSFT    Microsoft'],
    ['', '  NYSE:JPM       JPMorgan Chase'],
    ['', '  NASDAQ:GOOGL   Alphabet'],
    ['', '  NYSE:V         Visa'],
    ['', '  NASDAQ:AMZN    Amazon'],
    ['', '  NYSE:WMT       Walmart'],
    ['', '  NYSE:COST      Costco (use NYSE:COST or NASDAQ:COST)'],
    ['', ''],
    ['', '© 2025 No Somos Ignorantes. All Rights Reserved.'],
    ['', 'nosomosignorantes.com']
  ];

  ws.getRange(1, 1, instructions.length, 2).setValues(instructions);
  ws.getRange('B2').setFontSize(18).setFontWeight('bold');
  ws.getRange('B4').setFontSize(13).setFontWeight('bold');
  ws.getRange('B12').setFontSize(13).setFontWeight('bold');
  ws.getRange('B19').setFontSize(13).setFontWeight('bold');
  ws.getRange('B25').setFontSize(13).setFontWeight('bold');
  ws.getRange('B29').setFontSize(13).setFontWeight('bold');
  ws.getRange('B34').setFontSize(13).setFontWeight('bold');
}
