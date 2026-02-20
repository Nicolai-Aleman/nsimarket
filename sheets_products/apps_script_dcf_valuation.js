/**
 * ═══════════════════════════════════════════════════════════════
 * DCF ENTERPRISE VALUATION - No Somos Ignorantes
 * Discounted Cash Flow Model for Stock Intrinsic Value
 * ═══════════════════════════════════════════════════════════════
 *
 * Creates a DCF valuation sheet that calculates the intrinsic
 * value of a company's stock based on projected free cash flows.
 *
 * LOCALE: Spanish (semicolons as argument separators)
 *
 * HOW TO USE:
 * 1. Run crearDCFValuation() from Apps Script
 * 2. Enter company data in the yellow input cells
 * 3. The model auto-calculates intrinsic value per share
 */

function crearDCFValuation() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var S = {
    headerBg:  '#1A1A2E',
    headerFg:  '#FFFFFF',
    inputBg:   '#FFF2CC',
    outputBg:  '#D9EAD3',
    labelBg:   '#F3F3F3',
    accentBg:  '#4472C4',
    resultBg:  '#E8D44D',
    font:      'Arial'
  };

  // Create sheets
  var sheetNames = ['DCF Inputs', 'DCF Valuation', 'Sensitivity Analysis', 'Summary'];
  sheetNames.forEach(function(name) {
    var sh = ss.getSheetByName(name);
    if (sh) {
      sh.clear(); sh.clearConditionalFormatRules();
      sh.getCharts().forEach(function(c) { sh.removeChart(c); });
    } else {
      ss.insertSheet(name);
    }
  });

  buildDCFInputs(ss, S);
  buildDCFValuation(ss, S);
  buildSensitivity(ss, S);
  buildSummary(ss, S);

  ss.setActiveSheet(ss.getSheetByName('DCF Inputs'));
  SpreadsheetApp.flush();
  ss.toast('DCF Valuation Model created! Enter your data in DCF Inputs.', 'Success', 5);
}

// ══════════════════════════════════════
// DCF INPUTS SHEET
// ══════════════════════════════════════
function buildDCFInputs(ss, S) {
  var ws = ss.getSheetByName('DCF Inputs');
  ws.setTabColor('#D4AF37');
  ws.setHiddenGridlines(true);
  ws.setColumnWidth(1, 20);
  ws.setColumnWidth(2, 300);
  ws.setColumnWidth(3, 150);
  ws.setColumnWidth(4, 40);
  ws.setColumnWidth(5, 300);
  ws.setColumnWidth(6, 150);

  // ---- TITLE ----
  ws.getRange('B1:F1').merge().setValue('DISCOUNTED CASH FLOW (DCF) VALUATION MODEL')
    .setFontSize(16).setFontWeight('bold').setBackground(S.headerBg).setFontColor(S.headerFg)
    .setHorizontalAlignment('center');

  ws.getRange('B2:F2').merge()
    .setValue('No Somos Ignorantes - Enterprise Valuation Tool')
    .setFontSize(10).setFontStyle('italic').setHorizontalAlignment('center')
    .setBackground(S.headerBg).setFontColor('#D4AF37');

  // ---- COMPANY INFO ----
  ws.getRange('B4').setValue('COMPANY INFORMATION').setFontWeight('bold')
    .setFontSize(12).setBackground(S.accentBg).setFontColor('white');
  ws.getRange('C4').setBackground(S.accentBg);

  var companyFields = [
    ['Company Name', 'HEAVY METAL INC.'],
    ['Ticker Symbol', 'NYSE:HMI'],
    ['Current Stock Price ($)', 15],
    ['Shares Outstanding', 40000000],
    ['Total Debt ($)', 300000000],
    ['Cash & Equivalents ($)', 0],
    ['Industry/Sector', 'Manufacturing']
  ];

  for (var i = 0; i < companyFields.length; i++) {
    var r = 5 + i;
    ws.getRange(r, 2).setValue(companyFields[i][0]).setFontWeight('bold').setBackground(S.labelBg);
    ws.getRange(r, 3).setValue(companyFields[i][1]).setBackground(S.inputBg)
      .setBorder(true,true,true,true,null,null);
    if (i >= 2 && i <= 5) {
      ws.getRange(r, 3).setNumberFormat('#,##0');
    }
  }

  // ---- DCF ASSUMPTIONS ----
  ws.getRange('E4').setValue('DCF ASSUMPTIONS').setFontWeight('bold')
    .setFontSize(12).setBackground(S.accentBg).setFontColor('white');
  ws.getRange('F4').setBackground(S.accentBg);

  var assumptions = [
    ['WACC (Weighted Avg Cost of Capital)', 0.14, '0.00%'],
    ['Terminal Growth Rate (g)', 0.04, '0.00%'],
    ['Projection Period (Years)', 5, '0'],
    ['Revenue Growth Rate (Year 1-3)', 0.15, '0.00%'],
    ['Revenue Growth Rate (Year 4-5)', 0.08, '0.00%'],
    ['FCF Margin (% of Revenue)', 0.12, '0.00%'],
    ['Tax Rate', 0.25, '0.00%']
  ];

  for (var i = 0; i < assumptions.length; i++) {
    var r = 5 + i;
    ws.getRange(r, 5).setValue(assumptions[i][0]).setFontWeight('bold').setBackground(S.labelBg);
    ws.getRange(r, 6).setValue(assumptions[i][1]).setBackground(S.inputBg)
      .setNumberFormat(assumptions[i][2])
      .setBorder(true,true,true,true,null,null);
  }

  // ---- FREE CASH FLOW PROJECTIONS ----
  ws.getRange('B14').setValue('FREE CASH FLOW PROJECTIONS (Millions $)')
    .setFontWeight('bold').setFontSize(12).setBackground(S.accentBg).setFontColor('white');
  ws.getRange('C14:H14').setBackground(S.accentBg);

  // Year headers
  ws.getRange('B15').setValue('').setBackground(S.headerBg);
  ws.getRange('C15').setValue('Current').setFontWeight('bold').setBackground(S.headerBg).setHorizontalAlignment('center');
  for (var y = 1; y <= 5; y++) {
    ws.getRange(15, 3+y).setValue('Year ' + y).setFontWeight('bold')
      .setBackground(S.headerBg).setHorizontalAlignment('center');
  }

  // Revenue row
  ws.getRange('B16').setValue('Revenue ($M)').setFontWeight('bold');
  ws.getRange('C16').setValue(500).setBackground(S.inputBg).setNumberFormat('#,##0')
    .setBorder(true,true,true,true,null,null);

  // Revenue projections (Year 1-3 use growth rate 1, Year 4-5 use growth rate 2)
  for (var y = 1; y <= 5; y++) {
    var prevCol = String.fromCharCode(66 + y + 1); // C, D, E, F, G
    var curCol = String.fromCharCode(67 + y + 1);  // D, E, F, G, H
    if (y <= 3) {
      ws.getRange(16, 3+y).setFormula('=' + prevCol + '16*(1+$F$8)')
        .setNumberFormat('#,##0').setBackground(S.outputBg);
    } else {
      ws.getRange(16, 3+y).setFormula('=' + prevCol + '16*(1+$F$9)')
        .setNumberFormat('#,##0').setBackground(S.outputBg);
    }
  }

  // FCF row
  ws.getRange('B17').setValue('Free Cash Flow ($M)').setFontWeight('bold');
  ws.getRange('C17').setFormula('=C16*$F$10').setNumberFormat('#,##0');
  for (var y = 1; y <= 5; y++) {
    var col = String.fromCharCode(67 + y);
    ws.getRange(17, 3+y).setFormula('=' + col + '16*$F$10')
      .setNumberFormat('#,##0').setBackground(S.outputBg);
  }

  // Terminal Value
  ws.getRange('B18').setValue('Terminal Value').setFontWeight('bold');
  ws.getRange(18, 8).setFormula('=H17*(1+$F$6)/($F$5-$F$6)')
    .setNumberFormat('#,##0').setBackground('#E8D44D').setFontWeight('bold');

  // Discount Factor
  ws.getRange('B19').setValue('Discount Factor').setFontWeight('bold');
  for (var y = 1; y <= 5; y++) {
    ws.getRange(19, 3+y).setFormula('=1/(1+$F$5)^' + y)
      .setNumberFormat('0.0000');
  }

  // PV of FCF
  ws.getRange('B20').setValue('PV of Free Cash Flow').setFontWeight('bold');
  for (var y = 1; y <= 5; y++) {
    var col = String.fromCharCode(67 + y);
    ws.getRange(20, 3+y).setFormula('=' + col + '17*' + col + '19')
      .setNumberFormat('#,##0').setBackground(S.outputBg);
  }

  // PV of Terminal Value
  ws.getRange('B21').setValue('PV of Terminal Value').setFontWeight('bold');
  ws.getRange(21, 8).setFormula('=H18*H19')
    .setNumberFormat('#,##0').setBackground(S.outputBg);
}

// ══════════════════════════════════════
// DCF VALUATION SHEET
// ══════════════════════════════════════
function buildDCFValuation(ss, S) {
  var ws = ss.getSheetByName('DCF Valuation');
  ws.setTabColor('#D4AF37');
  ws.setHiddenGridlines(true);
  ws.setColumnWidth(1, 20);
  ws.setColumnWidth(2, 350);
  ws.setColumnWidth(3, 200);
  ws.setColumnWidth(4, 150);

  // ---- TITLE ----
  ws.getRange('B1:D1').merge().setValue('ENTERPRISE VALUATION SUMMARY')
    .setFontSize(16).setFontWeight('bold').setBackground(S.headerBg).setFontColor(S.headerFg)
    .setHorizontalAlignment('center');

  // ---- VALUATION CALCULATION ----
  ws.getRange('B3').setValue('VALUATION CALCULATION').setFontWeight('bold')
    .setFontSize(12).setBackground(S.accentBg).setFontColor('white');
  ws.getRange('C3:D3').setBackground(S.accentBg);

  var valRows = [
    ['PV of All Projected Free Cash Flows', '=SUM(\'DCF Inputs\'!D20:H20)', '#,##0'],
    ['PV of Terminal Value', "='DCF Inputs'!H21", '#,##0'],
    ['', '', ''],
    ['Enterprise Value (EV)', '=C4+C5', '#,##0'],
    ['', '', ''],
    ['(-) Total Debt', "='DCF Inputs'!C9", '#,##0'],
    ['(+) Cash & Equivalents', "='DCF Inputs'!C10", '#,##0'],
    ['', '', ''],
    ['Equity Value', '=C7-C9+C10', '#,##0'],
    ['', '', ''],
    ['Shares Outstanding', "='DCF Inputs'!C8", '#,##0'],
    ['', '', ''],
    ['INTRINSIC VALUE PER SHARE', '=IFERROR(C12/C14;0)', '$#,##0.00'],
    ['Current Market Price', "='DCF Inputs'!C7", '$#,##0.00'],
    ['', '', ''],
    ['Upside / Downside', '=IFERROR((C16-C17)/C17;0)', '0.0%']
  ];

  for (var i = 0; i < valRows.length; i++) {
    var r = 4 + i;
    if (valRows[i][0] === '') continue;

    ws.getRange(r, 2).setValue(valRows[i][0]).setFontWeight('bold');

    if (valRows[i][1].charAt(0) === '=') {
      ws.getRange(r, 3).setFormula(valRows[i][1]);
    } else {
      ws.getRange(r, 3).setValue(valRows[i][1]);
    }
    ws.getRange(r, 3).setNumberFormat(valRows[i][2]);
  }

  // Highlight key results
  ws.getRange('B7').setFontSize(13);
  ws.getRange('C7').setBackground('#E8D44D').setFontWeight('bold').setFontSize(13);

  ws.getRange('B12').setFontSize(13);
  ws.getRange('C12').setBackground(S.outputBg).setFontWeight('bold').setFontSize(13);

  ws.getRange('B16').setFontSize(16).setBackground(S.headerBg).setFontColor(S.headerFg);
  ws.getRange('C16').setFontSize(18).setFontWeight('bold').setBackground('#27AE60').setFontColor('white');

  ws.getRange('B17').setFontSize(12);
  ws.getRange('C17').setBackground(S.labelBg).setFontSize(12);

  // Upside/downside with conditional color
  ws.getRange('B19').setFontSize(14).setFontWeight('bold');
  ws.getRange('C19').setFontSize(14).setFontWeight('bold');

  var upsideRange = ws.getRange('C19');
  var rules = [
    SpreadsheetApp.newConditionalFormatRule()
      .whenNumberGreaterThan(0).setBackground('#27AE60').setFontColor('white')
      .setRanges([upsideRange]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenNumberLessThan(0).setBackground('#E74C3C').setFontColor('white')
      .setRanges([upsideRange]).build()
  ];
  ws.setConditionalFormatRules(rules);

  // ---- VERDICT ----
  ws.getRange('B21').setValue('VERDICT').setFontWeight('bold').setFontSize(14)
    .setBackground(S.headerBg).setFontColor(S.headerFg);
  ws.getRange('C21:D21').merge().setBackground(S.headerBg);

  ws.getRange('B22:D22').merge().setFormula(
    '=IF(C16>C17;"UNDERVALUED - The stock appears to trade below its intrinsic value. Potential BUY.";' +
    '"OVERVALUED - The stock appears to trade above its intrinsic value. Caution advised.")'
  ).setFontSize(12).setFontWeight('bold').setWrap(true).setHorizontalAlignment('center');

  var verdictRange = ws.getRange('B22:D22');
  ws.setConditionalFormatRules(ws.getConditionalFormatRules().concat([
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains('UNDERVALUED').setBackground('#D5F5E3').setFontColor('#27AE60')
      .setRanges([verdictRange]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains('OVERVALUED').setBackground('#FADBD8').setFontColor('#E74C3C')
      .setRanges([verdictRange]).build()
  ]));
}

// ══════════════════════════════════════
// SENSITIVITY ANALYSIS SHEET
// ══════════════════════════════════════
function buildSensitivity(ss, S) {
  var ws = ss.getSheetByName('Sensitivity Analysis');
  ws.setTabColor('#E74C3C');
  ws.setHiddenGridlines(true);
  ws.setColumnWidth(1, 20);
  ws.setColumnWidth(2, 150);

  ws.getRange('B1:I1').merge().setValue('SENSITIVITY ANALYSIS - Intrinsic Value per Share')
    .setFontSize(14).setFontWeight('bold').setBackground(S.headerBg).setFontColor(S.headerFg)
    .setHorizontalAlignment('center');

  ws.getRange('B2:I2').merge()
    .setValue('How does the intrinsic value change with different WACC and Growth Rate assumptions?')
    .setFontStyle('italic').setHorizontalAlignment('center');

  // WACC values (columns): 10%, 12%, 14%, 16%, 18%, 20%
  var waccValues = [0.10, 0.12, 0.14, 0.16, 0.18, 0.20];
  // Growth rate values (rows): 2%, 3%, 4%, 5%, 6%
  var growthValues = [0.02, 0.03, 0.04, 0.05, 0.06];

  // Headers
  ws.getRange('B4').setValue('WACC →').setFontWeight('bold').setBackground(S.headerBg).setFontColor('white');
  ws.getRange('B5').setValue('Growth ↓').setFontWeight('bold').setBackground(S.headerBg).setFontColor('white');

  for (var w = 0; w < waccValues.length; w++) {
    ws.getRange(4, 3+w).setValue(waccValues[w]).setNumberFormat('0%')
      .setFontWeight('bold').setBackground(S.headerBg).setFontColor('white')
      .setHorizontalAlignment('center');
  }

  for (var g = 0; g < growthValues.length; g++) {
    ws.getRange(5+g, 2).setValue(growthValues[g]).setNumberFormat('0%')
      .setFontWeight('bold').setBackground(S.accentBg).setFontColor('white');
  }

  // Sensitivity calculations
  // Intrinsic Value = (PV_FCFs + TV/(1+WACC)^5 - Debt + Cash) / Shares
  // We approximate TV = FCF_5 * (1+g) / (WACC - g)
  for (var g = 0; g < growthValues.length; g++) {
    for (var w = 0; w < waccValues.length; w++) {
      var wacc = waccValues[w];
      var growth = growthValues[g];
      // Reference FCF projections from DCF Inputs
      // Use a formula that recalculates PV with different WACC/growth
      ws.getRange(5+g, 3+w).setFormula(
        '=IFERROR(LET(' +
        'fcf1;\'DCF Inputs\'!D17;fcf2;\'DCF Inputs\'!E17;fcf3;\'DCF Inputs\'!F17;fcf4;\'DCF Inputs\'!G17;fcf5;\'DCF Inputs\'!H17;' +
        'wacc;' + CL(3+w) + '4;' +
        'g;$B$' + (5+g) + ';' +
        'tv;fcf5*(1+g)/(wacc-g);' +
        'pv;fcf1/(1+wacc)+fcf2/(1+wacc)^2+fcf3/(1+wacc)^3+fcf4/(1+wacc)^4+(fcf5+tv)/(1+wacc)^5;' +
        'ev;pv*1000000;' +  // Convert from millions
        'equity;ev-\'DCF Inputs\'!C9+\'DCF Inputs\'!C10;' +
        'equity/\'DCF Inputs\'!C8);"N/A")'
      ).setNumberFormat('$#,##0.00').setHorizontalAlignment('center');
    }
  }

  // Highlight the cell that matches current assumptions
  var senRange = ws.getRange(5, 3, growthValues.length, waccValues.length);
  // Color scale: green = higher value, red = lower
  var ruleColor = SpreadsheetApp.newConditionalFormatRule()
    .setGradientMaxpointWithValue('#27AE60', SpreadsheetApp.InterpolationType.PERCENTILE, '90')
    .setGradientMidpointWithValue('#FFFFCC', SpreadsheetApp.InterpolationType.PERCENTILE, '50')
    .setGradientMinpointWithValue('#E74C3C', SpreadsheetApp.InterpolationType.PERCENTILE, '10')
    .setRanges([senRange]).build();
  ws.setConditionalFormatRules([ruleColor]);

  // Current market price reference line
  ws.getRange('B11').setValue('Current Market Price:').setFontWeight('bold');
  ws.getRange('C11').setFormula("='DCF Inputs'!C7").setNumberFormat('$#,##0.00')
    .setFontWeight('bold').setFontSize(13);
  ws.getRange('D11').setValue('← Cells ABOVE this price suggest undervaluation')
    .setFontStyle('italic').setFontColor('#27AE60');
}

// ══════════════════════════════════════
// SUMMARY SHEET
// ══════════════════════════════════════
function buildSummary(ss, S) {
  var ws = ss.getSheetByName('Summary');
  ws.setTabColor('#27AE60');
  ws.setHiddenGridlines(true);
  ws.setColumnWidth(1, 20);
  ws.setColumnWidth(2, 300);
  ws.setColumnWidth(3, 200);

  ws.getRange('B1:C1').merge().setValue('VALUATION SUMMARY')
    .setFontSize(18).setFontWeight('bold').setBackground(S.headerBg).setFontColor(S.headerFg)
    .setHorizontalAlignment('center');

  ws.getRange('B2:C2').merge()
    .setValue('No Somos Ignorantes - Enterprise Valuation')
    .setFontSize(10).setBackground(S.headerBg).setFontColor('#D4AF37')
    .setHorizontalAlignment('center');

  // Key metrics summary
  var summary = [
    ['Company', "='DCF Inputs'!C5", ''],
    ['Ticker', "='DCF Inputs'!C6", ''],
    ['', '', ''],
    ['Enterprise Value', "='DCF Valuation'!C7", '$#,##0'],
    ['Equity Value', "='DCF Valuation'!C12", '$#,##0'],
    ['', '', ''],
    ['Intrinsic Value / Share', "='DCF Valuation'!C16", '$#,##0.00'],
    ['Market Price / Share', "='DCF Inputs'!C7", '$#,##0.00'],
    ['Upside / Downside', "='DCF Valuation'!C19", '0.0%'],
    ['', '', ''],
    ['WACC Used', "='DCF Inputs'!F5", '0.0%'],
    ['Terminal Growth Rate', "='DCF Inputs'!F6", '0.0%'],
    ['Projection Period', "='DCF Inputs'!F7", '0 Years'],
    ['', '', ''],
    ['Verdict', "='DCF Valuation'!B22", '']
  ];

  for (var i = 0; i < summary.length; i++) {
    var r = 4 + i;
    if (summary[i][0] === '') continue;
    ws.getRange(r, 2).setValue(summary[i][0]).setFontWeight('bold').setFontSize(11);
    if (summary[i][1].charAt(0) === '=') {
      ws.getRange(r, 3).setFormula(summary[i][1]);
    }
    if (summary[i][2]) ws.getRange(r, 3).setNumberFormat(summary[i][2]);
  }

  // Highlight intrinsic value
  ws.getRange('B10').setFontSize(14);
  ws.getRange('C10').setFontSize(16).setFontWeight('bold').setBackground('#27AE60').setFontColor('white');

  // Disclaimer
  ws.getRange('B20:C20').merge()
    .setValue('DISCLAIMER: This valuation model is for educational purposes only. ' +
      'It should not be considered financial advice. Always conduct your own research ' +
      'and consult with a financial professional before making investment decisions.')
    .setFontSize(8).setFontStyle('italic').setFontColor('#999999').setWrap(true);

  ws.getRange('B22:C22').merge()
    .setValue('© 2025 No Somos Ignorantes. nosomosignorantes.com')
    .setHorizontalAlignment('center').setFontSize(9);
}

// Helper
function CL(n) {
  var s = '';
  while (n > 0) { var m = (n-1) % 26; s = String.fromCharCode(65+m) + s; n = Math.floor((n-1)/26); }
  return s;
}
