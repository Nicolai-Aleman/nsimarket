# No Somos Ignorantes - Excel Product Specifications
## Complete Product Architecture & Design System

---

## PART A: DESIGN STANDARDS

### 1. Visual Design System

#### Color Palette
```
PRIMARY:
- Brand Gold: #D4AF37
- Dark Background: #1a1a2e
- Card Background: #16213e
- Accent Blue: #0f3460

FUNCTIONAL:
- Success Green: #10B981
- Warning Orange: #F59E0B
- Error Red: #EF4444
- Info Blue: #3B82F6
- Neutral Gray: #6B7280
```

#### Excel Cell Formatting
```
INPUTS (user enters data):
- Background: Light Yellow (#FFF9C4)
- Border: 1px solid Gold (#D4AF37)
- Font: Calibri 11pt, Black
- Cell protection: UNLOCKED

OUTPUTS (calculated):
- Background: Light Green (#E8F5E9)
- Border: 1px solid Green (#10B981)
- Font: Calibri 11pt Bold, Dark Green
- Cell protection: LOCKED

HEADERS:
- Background: Brand Gold (#D4AF37)
- Font: Calibri 12pt Bold, White
- Alignment: Center

LABELS:
- Background: None
- Font: Calibri 11pt, Dark Gray (#374151)
```

### 2. Versioning System
```
Format: vX.Y.Z
- X = Major version (structure changes)
- Y = Minor version (formula fixes, features)
- Z = Patch (typos, small fixes)

Example: v1.0.0 → v1.0.1 → v1.1.0 → v2.0.0

Version cell location: Always in cell A1 of "Config" sheet
```

### 3. Error-Proofing Strategies
```
1. DATA VALIDATION
   - Dropdown lists for categories
   - Number ranges for percentages (0-100)
   - Date format enforcement
   - Prevent negative numbers where inappropriate

2. CONDITIONAL FORMATTING
   - Red highlight for invalid entries
   - Green checkmark for valid data
   - Yellow warning for edge cases

3. ERROR HANDLING IN FORMULAS
   - IFERROR() wrapper on all complex formulas
   - #N/A display as "Sin datos" or "-"
   - Divide by zero protection

4. INPUT VALIDATION MESSAGES
   - Title: "Dato requerido"
   - Message: Clear instruction in Spanish

5. PROTECTED SHEETS
   - All formula cells locked
   - Only input cells editable
   - Password: "nsi2024" (internal only)
```

### 4. UX Principles for Excel Products
```
1. PROGRESSIVE DISCLOSURE
   - Dashboard first (summary view)
   - Details on subsequent sheets
   - Hidden advanced features

2. CONSISTENCY
   - Same input location on every product
   - Same color coding
   - Same navigation structure

3. FEEDBACK
   - Real-time calculation updates
   - Visual indicators (icons, colors)
   - Progress tracking where applicable

4. ACCESSIBILITY
   - High contrast colors
   - Clear labels
   - Keyboard navigation friendly
```

---

## PART B: PRODUCT SPECIFICATIONS

---

## PRODUCT 1: MORTGAGE CREDIT COMPARATOR
### Comparador de Créditos Hipotecarios

**PURPOSE:** Compare up to 5 mortgage offers from different banks to find the best deal.

**TARGET USER:** People looking to buy a home in Bolivia

**PRICE:** Bs. 49

#### SHEET STRUCTURE

| Sheet | Purpose |
|-------|---------|
| Dashboard | Summary comparison view |
| Bank1-5 | Individual bank input sheets |
| Amortization | Detailed payment schedules |
| Config | Settings, version, instructions |

#### DETAILED BLUEPRINT

**DASHBOARD SHEET**
```
╔══════════════════════════════════════════════════════════════╗
║  COMPARADOR DE CRÉDITOS HIPOTECARIOS v1.0                    ║
║  No Somos Ignorantes                                         ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  MONTO DEL PRÉSTAMO: [___________] Bs.    INPUT             ║
║  PLAZO DESEADO:      [___________] meses  INPUT             ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  COMPARACIÓN RÁPIDA                                          ║
╠══════════════════════════════════════════════════════════════╣
║  Banco         Tasa    Cuota      Total      Diferencia     ║
║  ─────────────────────────────────────────────────────────   ║
║  [Banco A]     12.5%   Bs.2,450   Bs.294K    Referencia     ║
║  [Banco B]     11.0%   Bs.2,320   Bs.278K    -Bs.16,000 ✓   ║
║  [Banco C]     13.0%   Bs.2,510   Bs.301K    +Bs.7,000 ✗    ║
║  [Banco D]     11.5%   Bs.2,385   Bs.286K    -Bs.8,000 ✓    ║
║  [Banco E]     14.0%   Bs.2,640   Bs.317K    +Bs.23,000 ✗   ║
║                                                              ║
║  🏆 MEJOR OPCIÓN: [Banco B] - Ahorras Bs.16,000             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**BANK INPUT SHEET (Bank1, Bank2, etc.)**
```
Row 1-3: Header with bank name input
Row 5: Tasa de interés anual (%) [INPUT]
Row 6: Comisión de apertura (%) [INPUT]
Row 7: Seguro de desgravamen (%) [INPUT]
Row 8: Otros costos fijos (Bs.) [INPUT]
Row 10: CÁLCULOS
Row 11: Cuota mensual [OUTPUT]
Row 12: Total a pagar [OUTPUT]
Row 13: Total intereses [OUTPUT]
Row 14: CAE (Costo Anual Equivalente) [OUTPUT]
```

#### KEY FORMULAS

```excel
// Monthly Payment (PMT)
=PMT(TasaAnual/12, Plazo, -Monto)

// Total Interest
=TotalPagar - Monto

// CAE (Annual Equivalent Cost)
=(((1+TasaMensualEfectiva)^12)-1)*100

// Best Option Finder
=INDEX(BankNames, MATCH(MIN(TotalPayments), TotalPayments, 0))
```

#### ASSUMPTIONS
- Fixed interest rate (tasa fija)
- Monthly payments (cuotas mensuales)
- No prepayment penalties
- Standard French amortization

#### EDGE CASES
- Zero interest rate → Show warning
- Term < 12 months → Recommend personal loan
- Amount > Bs.2M → Large loan considerations

#### QA CHECKLIST
- [ ] PMT formula calculates correctly
- [ ] All 5 banks can be compared
- [ ] Best option highlights correctly
- [ ] Amortization table matches totals
- [ ] Input validation prevents negative values
- [ ] Currency formatting consistent

---

## PRODUCT 2: SNOWBALL DEBT AUTOMATION
### Automatización Bola de Nieve

**PURPOSE:** Eliminate multiple debts using the Snowball method (smallest balance first).

**TARGET USER:** People with multiple debts wanting a clear payoff plan

**PRICE:** Bs. 49

#### SHEET STRUCTURE

| Sheet | Purpose |
|-------|---------|
| Dashboard | Progress overview and timeline |
| Deudas | Enter all debts (up to 10) |
| Plan | Month-by-month payment schedule |
| Motivación | Visual progress and milestones |
| Config | Settings and instructions |

#### DETAILED BLUEPRINT

**DASHBOARD SHEET**
```
╔══════════════════════════════════════════════════════════════╗
║  BOLA DE NIEVE - ELIMINA TUS DEUDAS v1.0                     ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  📊 RESUMEN DE TUS DEUDAS                                    ║
║  ─────────────────────────────────────────────────────────   ║
║  Total deudas:           Bs. 45,000                          ║
║  Pago mínimo total:      Bs.  2,150 /mes                     ║
║  Pago extra disponible:  Bs.    500 /mes  [INPUT]            ║
║                                                              ║
║  ⏱️ TIEMPO PARA LIBERTAD                                     ║
║  ─────────────────────────────────────────────────────────   ║
║  Sin bola de nieve:      36 meses                            ║
║  CON bola de nieve:      24 meses  ✓                         ║
║  Meses ahorrados:        12 meses                            ║
║                                                              ║
║  💰 AHORRO EN INTERESES                                      ║
║  ─────────────────────────────────────────────────────────   ║
║  Intereses sin método:   Bs. 12,500                          ║
║  Intereses CON método:   Bs.  8,200                          ║
║  TU AHORRO:              Bs.  4,300 ✓                        ║
║                                                              ║
║  [═══════════════════░░░░░░░░░░] 65% COMPLETADO              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**DEUDAS SHEET**
```
Columns:
A: Nombre de la deuda [INPUT]
B: Saldo actual (Bs.) [INPUT]
C: Tasa de interés anual (%) [INPUT]
D: Pago mínimo (Bs.) [INPUT]
E: Orden de pago [OUTPUT - auto-calculated by balance]
F: Estado [OUTPUT - Pendiente/Pagando/Pagada]

Rows: Header + 10 debt rows
```

#### KEY FORMULAS

```excel
// Sort debts by balance (Snowball order)
=RANK(Balance, AllBalances, 1)

// Months to payoff single debt
=NPER(Rate/12, -Payment, Balance)

// Total months with snowball effect
=SUMPRODUCT(MonthsPerDebt) - SnowballBonus

// Interest saved
=TotalInterestNormal - TotalInterestSnowball

// Progress percentage
=1 - (RemainingBalance / OriginalTotalBalance)
```

#### ASSUMPTIONS
- Minimum payments stay constant
- Extra payment applied to smallest debt
- When debt paid, payment rolls to next
- Interest compounds monthly

#### EDGE CASES
- Debt with 0% interest → Still include, last priority
- Extra payment = 0 → Show minimum timeline
- Single debt → Redirect to simple calculator
- Debt larger than 50% of total → Flag as "anchor debt"

#### QA CHECKLIST
- [ ] Debts auto-sort by balance
- [ ] Snowball effect calculates correctly
- [ ] Progress bar updates with payments
- [ ] Month counter accurate
- [ ] Interest savings displayed
- [ ] Cannot enter negative balances

---

## PRODUCT 3: DEBT AMORTIZER PRO
### Amortizador de Deudas Pro

**PURPOSE:** Generate detailed amortization schedules for any loan type.

**TARGET USER:** Financial planners, accountants, loan officers

**PRICE:** Bs. 69

#### SHEET STRUCTURE

| Sheet | Purpose |
|-------|---------|
| Calculadora | Main input and summary |
| Tabla_Frances | French amortization schedule |
| Tabla_Aleman | German amortization schedule |
| Tabla_Americano | American amortization schedule |
| Comparación | Compare all 3 methods |
| Config | Settings and export options |

#### DETAILED BLUEPRINT

**CALCULADORA SHEET**
```
╔══════════════════════════════════════════════════════════════╗
║  AMORTIZADOR DE DEUDAS PRO v1.0                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  DATOS DEL PRÉSTAMO                                          ║
║  ─────────────────────────────────────────────────────────   ║
║  Capital:                 [___________] Bs.    INPUT         ║
║  Tasa de interés anual:   [___________] %      INPUT         ║
║  Plazo:                   [___________] meses  INPUT         ║
║  Fecha de inicio:         [___________]        INPUT         ║
║                                                              ║
║  MÉTODO DE AMORTIZACIÓN                                      ║
║  ─────────────────────────────────────────────────────────   ║
║  [●] Francés (cuota fija)                                    ║
║  [ ] Alemán (amortización fija)                              ║
║  [ ] Americano (interés + balloon)                           ║
║                                                              ║
║  RESULTADO                                                   ║
║  ─────────────────────────────────────────────────────────   ║
║  Cuota mensual:           Bs. 2,450.00                       ║
║  Total a pagar:           Bs. 294,000.00                     ║
║  Total intereses:         Bs. 94,000.00                      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**TABLA_FRANCES SHEET**
```
Columns:
A: # Cuota
B: Fecha
C: Saldo inicial
D: Cuota
E: Interés
F: Amortización (Capital)
G: Saldo final

Rows: Dynamic up to 360 (30 years)
```

#### KEY FORMULAS

```excel
// French Method - Fixed Payment
Cuota = PMT(Tasa/12, Plazo, -Capital)
Interes[n] = SaldoInicial[n] * (Tasa/12)
Amortizacion[n] = Cuota - Interes[n]

// German Method - Fixed Amortization
AmortizacionFija = Capital / Plazo
Interes[n] = SaldoInicial[n] * (Tasa/12)
Cuota[n] = AmortizacionFija + Interes[n]

// American Method - Interest Only + Balloon
Cuota[1 to n-1] = Capital * (Tasa/12)
Cuota[n] = Capital + (Capital * Tasa/12)
```

#### ASSUMPTIONS
- Monthly payments
- Interest calculated on remaining balance
- No prepayments modeled (separate feature)
- No grace period

#### EDGE CASES
- 0% interest → Straight-line amortization
- Term > 360 months → Warning message
- Capital < Bs.1000 → Suggest other products
- Late payment simulation → Future feature

#### QA CHECKLIST
- [ ] All 3 methods calculate correctly
- [ ] Final balance = 0 in all methods
- [ ] Dates sequence correctly
- [ ] Totals match sum of columns
- [ ] Export to PDF works
- [ ] Print formatting correct

---

## PRODUCT 4: CREDIT SCORE ANALYZER
### Analizador de Puntaje Crediticio

**PURPOSE:** Understand and simulate your credit score factors.

**TARGET USER:** People wanting to improve their credit

**PRICE:** Bs. 39

#### SHEET STRUCTURE

| Sheet | Purpose |
|-------|---------|
| Dashboard | Current score and factors |
| Historial | Payment history tracker |
| Simulador | What-if scenarios |
| Recomendaciones | Personalized tips |
| Config | Settings |

#### DETAILED BLUEPRINT

**DASHBOARD SHEET**
```
╔══════════════════════════════════════════════════════════════╗
║  ANALIZADOR DE PUNTAJE CREDITICIO v1.0                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  TU PUNTAJE ESTIMADO                                         ║
║  ─────────────────────────────────────────────────────────   ║
║           ┌─────────────┐                                    ║
║           │     725     │  BUENO                             ║
║           └─────────────┘                                    ║
║      [███████████████░░░░░]                                  ║
║      300              850                                    ║
║                                                              ║
║  FACTORES QUE AFECTAN TU PUNTAJE                            ║
║  ─────────────────────────────────────────────────────────   ║
║                                                              ║
║  ✅ Historial de pagos (35%)        90/100                   ║
║  ⚠️ Uso de crédito (30%)            65/100  ← MEJORAR        ║
║  ✅ Antigüedad (15%)                80/100                   ║
║  ✅ Tipos de crédito (10%)          75/100                   ║
║  ⚠️ Consultas recientes (10%)       50/100  ← MEJORAR        ║
║                                                              ║
║  PRÓXIMO NIVEL: 750 (Muy Bueno)                             ║
║  Necesitas: +25 puntos                                       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

#### KEY FORMULAS

```excel
// Score calculation (simplified Bolivian model)
=ROUND(
  (PaymentHistory * 0.35) +
  (CreditUtilization * 0.30) +
  (AccountAge * 0.15) +
  (CreditMix * 0.10) +
  (RecentInquiries * 0.10)
, 0) * 5.5 + 300

// Payment history score (0-100)
=100 - (LatePayments30 * 10) - (LatePayments60 * 20) - (LatePayments90 * 40)

// Credit utilization score (0-100)
=IF(Utilization < 10%, 100,
 IF(Utilization < 30%, 90,
 IF(Utilization < 50%, 70,
 IF(Utilization < 75%, 50, 30))))
```

#### ASSUMPTIONS
- Bolivian credit bureau model approximation
- Self-reported data (educational purposes)
- Not official credit score

#### EDGE CASES
- No credit history → Show "sin historial" guidance
- All inputs blank → Default to neutral values
- Perfect inputs → Cap at 850

#### QA CHECKLIST
- [ ] Score stays within 300-850 range
- [ ] All factor weights sum to 100%
- [ ] Recommendations update with scores
- [ ] Visual meter displays correctly
- [ ] Simulator shows realistic changes

---

## PRODUCT 5: BUDGET 50/30/20 (FREE LEAD MAGNET)
### Presupuesto 50/30/20

**PURPOSE:** Simple budget using the 50/30/20 rule.

**TARGET USER:** Anyone starting with budgeting

**PRICE:** FREE (lead magnet)

#### SHEET STRUCTURE

| Sheet | Purpose |
|-------|---------|
| Presupuesto | Main budget view |
| Config | Branding, version |

#### DETAILED BLUEPRINT

**PRESUPUESTO SHEET**
```
╔══════════════════════════════════════════════════════════════╗
║  PRESUPUESTO 50/30/20 - GRATIS                               ║
║  No Somos Ignorantes                                         ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  TU INGRESO MENSUAL: [___________] Bs.    INPUT              ║
║                                                              ║
║  ─────────────────────────────────────────────────────────   ║
║                                                              ║
║  50% NECESIDADES                    Bs. 2,500 disponible     ║
║  ─────────────────────────────────────────────────────────   ║
║  Vivienda                [1,200]    ██████████░░░ 48%        ║
║  Servicios               [  200]    ████░░░░░░░░░  8%        ║
║  Transporte              [  300]    ██████░░░░░░░ 12%        ║
║  Alimentación            [  600]    ████████████░ 24%        ║
║  TOTAL NECESIDADES:       2,300     [DENTRO DEL LÍMITE ✓]    ║
║                                                              ║
║  30% DESEOS                         Bs. 1,500 disponible     ║
║  ─────────────────────────────────────────────────────────   ║
║  Entretenimiento         [  400]    ███████░░░░░░ 27%        ║
║  Compras                 [  300]    █████░░░░░░░░ 20%        ║
║  Restaurantes            [  200]    ████░░░░░░░░░ 13%        ║
║  TOTAL DESEOS:              900     [DENTRO DEL LÍMITE ✓]    ║
║                                                              ║
║  20% AHORRO                         Bs. 1,000 disponible     ║
║  ─────────────────────────────────────────────────────────   ║
║  Fondo de emergencia     [  500]    ██████████░░░ 50%        ║
║  Inversiones             [  300]    ██████░░░░░░░ 30%        ║
║  Metas                   [  200]    ████░░░░░░░░░ 20%        ║
║  TOTAL AHORRO:            1,000     [EXACTO ✓]               ║
║                                                              ║
║  ★ ¿Quieres más control? Descubre nuestro                   ║
║    PRESUPUESTO PERSONAL COMPLETO → [Ver más]                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

#### KEY FORMULAS

```excel
// Category limits
Necesidades_Limite = Ingreso * 0.50
Deseos_Limite = Ingreso * 0.30
Ahorro_Limite = Ingreso * 0.20

// Status indicator
=IF(Total <= Limite, "✓ DENTRO DEL LÍMITE", "⚠ EXCEDIDO")

// Progress bar (visual)
=REPT("█", ROUND(Porcentaje*10,0)) & REPT("░", 10-ROUND(Porcentaje*10,0))
```

#### PURPOSE AS LEAD MAGNET
- Simple, immediately useful
- Shows brand quality
- Upsell message embedded
- Email required for download

---

## PRODUCT 6: UNIQUE CODE SALES SYSTEM
### Sistema de Ventas con Código Único

**PURPOSE:** Track sales with unique product codes for inventory control.

**TARGET USER:** Small business owners, retail shops

**PRICE:** Bs. 89

#### SHEET STRUCTURE

| Sheet | Purpose |
|-------|---------|
| Dashboard | Sales overview and KPIs |
| Productos | Product database with codes |
| Ventas | Transaction entry |
| Inventario | Stock tracking |
| Reportes | Sales reports |
| Config | Settings, code format |

#### DETAILED BLUEPRINT

**PRODUCTOS SHEET**
```
Columns:
A: Código único [AUTO-GENERATED or INPUT]
B: Nombre del producto [INPUT]
C: Categoría [DROPDOWN]
D: Precio de compra (Bs.) [INPUT]
E: Precio de venta (Bs.) [INPUT]
F: Margen (%) [CALCULATED]
G: Stock actual [CALCULATED from inventory]
H: Stock mínimo [INPUT]
I: Estado [CALCULATED: Normal/Bajo/Agotado]
```

**VENTAS SHEET**
```
Columns:
A: Fecha [INPUT/AUTO]
B: # Venta [AUTO]
C: Código producto [INPUT with LOOKUP]
D: Producto (auto-fill) [VLOOKUP]
E: Cantidad [INPUT]
F: Precio unitario [VLOOKUP]
G: Descuento (%) [INPUT]
H: Total [CALCULATED]
I: Método de pago [DROPDOWN]
J: Vendedor [INPUT/DROPDOWN]
```

#### KEY FORMULAS

```excel
// Unique code generator
="PROD-" & TEXT(ROW()-1, "0000")

// Auto-fill product name
=IFERROR(VLOOKUP(Codigo, Productos, 2, FALSE), "Código no encontrado")

// Margin calculation
=(PrecioVenta - PrecioCompra) / PrecioCompra * 100

// Stock status
=IF(Stock=0, "AGOTADO", IF(Stock<=StockMinimo, "BAJO", "NORMAL"))

// Daily sales total
=SUMIFS(Ventas[Total], Ventas[Fecha], TODAY())
```

#### QA CHECKLIST
- [ ] Codes auto-generate correctly
- [ ] VLOOKUP finds products
- [ ] Stock updates with sales
- [ ] Reports filter by date range
- [ ] Low stock alerts trigger

---

## PRODUCT 7: OPERATING EXPENSES CONTROL
### Control de Gastos Operativos

**PURPOSE:** Track and analyze recurring business operating expenses.

**TARGET USER:** Business owners, operations managers

**PRICE:** Bs. 59

#### SHEET STRUCTURE

| Sheet | Purpose |
|-------|---------|
| Dashboard | Monthly expense overview |
| Gastos | Expense entry by category |
| Presupuesto | Budget vs actual comparison |
| Tendencias | Historical trend analysis |
| Config | Categories, settings |

#### KEY FORMULAS

```excel
// Monthly total by category
=SUMIFS(Gastos[Monto], Gastos[Categoría], Categoria, Gastos[Mes], Mes)

// Budget variance
=Presupuestado - Real

// Variance percentage
=(Presupuestado - Real) / Presupuestado * 100

// Year-over-year comparison
=SUMIFS(Gastos[Monto], Gastos[Año], AñoActual) -
 SUMIFS(Gastos[Monto], Gastos[Año], AñoActual-1)
```

---

## PRODUCT 8: INDIRECT COSTS CALCULATOR
### Calculadora de Costos Indirectos

**PURPOSE:** Allocate indirect costs to products/services correctly.

**TARGET USER:** Cost accountants, manufacturers, service businesses

**PRICE:** Bs. 69

#### SHEET STRUCTURE

| Sheet | Purpose |
|-------|---------|
| Dashboard | Cost allocation summary |
| CostosIndirectos | Enter all indirect costs |
| BaseAsignacion | Define allocation bases |
| Productos | Product cost buildup |
| Config | Settings |

#### KEY FORMULAS

```excel
// Total indirect costs
=SUM(CostosIndirectos[Monto])

// Allocation rate
=TotalCostosIndirectos / TotalBaseAsignacion

// Indirect cost per unit
=TasaAsignacion * UnidadesBase

// Full product cost
=CostoDirecto + CostoIndirectoAsignado
```

---

## PRODUCT 9: SALES COST MANAGER
### Gestor de Costo de Ventas

**PURPOSE:** Track cost of goods sold (COGS) and gross margin.

**TARGET USER:** Retailers, wholesalers, product businesses

**PRICE:** Bs. 59

#### SHEET STRUCTURE

| Sheet | Purpose |
|-------|---------|
| Dashboard | Gross profit overview |
| Inventario | Beginning/ending inventory |
| Compras | Purchase tracking |
| Ventas | Sales with COGS |
| Config | Settings |

#### KEY FORMULAS

```excel
// COGS calculation
=InventarioInicial + Compras - InventarioFinal

// Gross margin
=(Ventas - COGS) / Ventas * 100

// Inventory turnover
=COGS / ((InventarioInicial + InventarioFinal) / 2)
```

---

## PRODUCT 10: ARPU CALCULATOR
### Calculadora de ARPU

**PURPOSE:** Calculate Average Revenue Per User for subscription/recurring businesses.

**TARGET USER:** SaaS, subscription box, membership businesses

**PRICE:** Bs. 49

#### SHEET STRUCTURE

| Sheet | Purpose |
|-------|---------|
| Dashboard | ARPU metrics and trends |
| Clientes | Customer database |
| Ingresos | Revenue tracking |
| Segmentos | ARPU by segment |
| Config | Settings |

#### KEY FORMULAS

```excel
// ARPU (simple)
=IngresoTotal / UsuariosActivos

// ARPU (monthly recurring)
=MRR / UsuariosActivos

// ARPU growth
=(ARPU_Actual - ARPU_Anterior) / ARPU_Anterior * 100

// LTV estimate
=ARPU * VidalPromedio
```

---

## PRODUCT 11: DUAL CASHFLOW (Bs/Sus)
### Flujo de Caja Dual (Bs/Sus)

**PURPOSE:** Manage cashflow in both Bolivianos and US Dollars with automatic conversion.

**TARGET USER:** Importers, exporters, businesses with dual currency

**PRICE:** Bs. 99

#### SHEET STRUCTURE

| Sheet | Purpose |
|-------|---------|
| Dashboard | Combined cashflow view |
| Flujo_BOB | Bolivianos cashflow |
| Flujo_USD | US Dollars cashflow |
| TipoCambio | Exchange rate history |
| Proyeccion | Cashflow forecast |
| Config | Settings |

#### KEY FORMULAS

```excel
// Convert USD to BOB
=MontoUSD * TipoCambio

// Combined balance
=SaldoBOB + (SaldoUSD * TipoCambio)

// Projected balance
=SaldoActual + SUMIFS(Proyecciones[Monto], Proyecciones[Tipo], "Ingreso") -
              SUMIFS(Proyecciones[Monto], Proyecciones[Tipo], "Egreso")
```

---

## PRODUCT 12: SALE PRICE CALCULATOR
### Calculadora de Precio de Venta

**PURPOSE:** Calculate the optimal sale price considering all costs and desired margin.

**TARGET USER:** Any business setting prices

**PRICE:** Bs. 49

#### SHEET STRUCTURE

| Sheet | Purpose |
|-------|---------|
| Calculadora | Main price calculator |
| Escenarios | Multiple pricing scenarios |
| Competencia | Competitor price comparison |
| Config | Settings |

#### KEY FORMULAS

```excel
// Cost-plus pricing
=CostoTotal * (1 + MargenDeseado/100)

// Target margin price
=CostoTotal / (1 - MargenDeseado/100)

// Break-even price
=CostosFijos/Unidades + CostoVariable

// Competitor position
=IF(MiPrecio < Competidor, "DEBAJO", IF(MiPrecio > Competidor, "ARRIBA", "IGUAL"))
```

---

## PRODUCT 13: FULL FINANCIAL STATEMENTS (PREMIUM)
### Estados Financieros Completos

**PURPOSE:** Generate professional Balance Sheet, Income Statement, and Cash Flow Statement.

**TARGET USER:** Accountants, finance managers, business owners

**PRICE:** Bs. 199

#### SHEET STRUCTURE

| Sheet | Purpose |
|-------|---------|
| Dashboard | Financial summary |
| PlanCuentas | Chart of accounts |
| Transacciones | Journal entries |
| BalanceGeneral | Balance Sheet |
| EstadoResultados | Income Statement |
| FlujoCaja | Cash Flow Statement |
| Razones | Financial ratios |
| Config | Settings, periods |

#### DETAILED BLUEPRINT

**BALANCE GENERAL SHEET**
```
╔══════════════════════════════════════════════════════════════╗
║  ESTADO DE SITUACIÓN FINANCIERA                              ║
║  Al [dd/mm/yyyy]                                             ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ACTIVOS                                                     ║
║  ─────────────────────────────────────────────────────────   ║
║  Activo Corriente                                            ║
║    Caja y bancos                     Bs.    25,000           ║
║    Cuentas por cobrar                Bs.    15,000           ║
║    Inventarios                       Bs.    30,000           ║
║  Total Activo Corriente              Bs.    70,000           ║
║                                                              ║
║  Activo No Corriente                                         ║
║    Propiedad, planta y equipo        Bs.   150,000           ║
║    Depreciación acumulada           (Bs.    30,000)          ║
║  Total Activo No Corriente           Bs.   120,000           ║
║                                                              ║
║  TOTAL ACTIVOS                       Bs.   190,000           ║
║                                                              ║
║  PASIVOS Y PATRIMONIO                                        ║
║  ─────────────────────────────────────────────────────────   ║
║  Pasivo Corriente                                            ║
║    Cuentas por pagar                 Bs.    20,000           ║
║    Deudas a corto plazo              Bs.    15,000           ║
║  Total Pasivo Corriente              Bs.    35,000           ║
║                                                              ║
║  Pasivo No Corriente                                         ║
║    Deudas a largo plazo              Bs.    50,000           ║
║  Total Pasivo No Corriente           Bs.    50,000           ║
║                                                              ║
║  TOTAL PASIVOS                       Bs.    85,000           ║
║                                                              ║
║  Patrimonio                                                  ║
║    Capital social                    Bs.    80,000           ║
║    Utilidades retenidas              Bs.    25,000           ║
║  TOTAL PATRIMONIO                    Bs.   105,000           ║
║                                                              ║
║  TOTAL PASIVOS + PATRIMONIO          Bs.   190,000           ║
║                                                              ║
║  Verificación: Activos = Pas+Pat     ✓ CUADRA                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

#### KEY FORMULAS

```excel
// Balance check
=IF(TotalActivos = TotalPasivos + TotalPatrimonio, "✓ CUADRA", "✗ ERROR")

// Current ratio
=ActivoCorriente / PasivoCorriente

// Quick ratio
=(ActivoCorriente - Inventarios) / PasivoCorriente

// ROE
=UtilidadNeta / Patrimonio * 100

// ROA
=UtilidadNeta / TotalActivos * 100

// Debt ratio
=TotalPasivos / TotalActivos * 100
```

#### QA CHECKLIST
- [ ] Balance sheet balances (A = L + E)
- [ ] Income statement links correctly
- [ ] Cash flow reconciles
- [ ] All accounts in chart
- [ ] Period comparisons work
- [ ] Financial ratios calculate
- [ ] Export formatting correct

---

## PART C: TEST SCENARIOS

### Universal Test Cases (All Products)

| Test | Action | Expected Result |
|------|--------|-----------------|
| Empty inputs | Leave all inputs blank | Default values or error message |
| Negative numbers | Enter -100 in amount field | Validation error |
| Large numbers | Enter 999,999,999 | Handles without overflow |
| Zero values | Enter 0 in divisor field | No #DIV/0! error |
| Special characters | Enter "Test@#$" in text field | Handled or rejected |
| Date format | Enter various date formats | Consistent parsing |
| Currency format | Mix commas and periods | Consistent handling |

### Product-Specific Tests

See individual product sections above for specific QA checklists.

---

## PART D: VERSION HISTORY TEMPLATE

```
Version: v1.0.0
Date: [Release date]
Changes:
- Initial release

Version: v1.0.1
Date: [Date]
Changes:
- Fixed formula in cell X
- Updated color scheme

Version: v1.1.0
Date: [Date]
Changes:
- Added new feature Y
- Improved performance
```
