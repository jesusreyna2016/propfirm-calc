import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";

const C = {
  bg:"#0a0d11", card:"#11161c", card2:"#0d1218",
  border:"#242f3a", border2:"#33414f",
  green:"#34c98a", red:"#ef5f6b", gold:"#c79235",
  blue:"#6f8cf5", purple:"#a78bfa", orange:"#e8933a", teal:"#22d3ee",
  text:"#e9eef3", muted:"#8695a6", dim:"#1b232c",
};
const fmt  = v => `$${Math.abs(Math.round(v)).toLocaleString("en-US")}`;
const fmtK = v => Math.abs(v)>=1000?`$${(Math.abs(v)/1000).toFixed(1)}k`:fmt(v);
const clamp = (v,lo,hi) => Math.max(lo,Math.min(hi,v));

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  es: {
    langBtn:"🇺🇸 EN", title:"Simulador Propfirm",
    subtitle:"Gratis. Cuántas cuentas para tu meta, riesgo de blow-up (Monte Carlo) y neto real tras fees e impuestos.",
    hFunded:"Fondeo/mes", hLive:"Vivo/mes", hNet:"Neto/mes", hPipeline:"Pipeline",
    phEval:"EVALUACIÓN", phFunded:"FONDEADA", phLive:"EN VIVO",
    tabSys:"Sistema", tabVar:"Varianza", tabRisk:"Riesgo", tabNet:"Neto", tabPipe:"Pipeline",
    // param strip
    pDailyMin:"Ganancia diaria mín", pDailyMax:"Ganancia diaria máx",
    pWithdraw:"Retiro por evento", pTrigger:"Trigger retiro (P&L)",
    pGraduate:"Retiros antes de ir a vivo", pAccs:"Total cuentas",
    pGoal:"Objetivo mensual", pLiveDaily:"Retiro diario en vivo",
    fmtGrad: v=>`${v}° retiro`, fmtAccs: v=>`${v} cuentas`, fmtH: v=>`${v}h`, fmtPct: v=>`${v}%`,
    // presets propfirm
    psLabel:"Cargar preset", psFirm:"Firma", psSize:"Tamaño", psCustom:"Personalizado",
    psApplied: f=>`✓ ${f} cargado`, psNote:"Punto de partida: reglas de evaluación (target, drawdown, fee). Cambian seguido; verifica con tu firma. Actualizado ago 2026.",
    shareBtn:"🔗 Compartir", shareOk:"✓ Enlace copiado", shareFail:"No se pudo copiar",
    // sistema KPIs
    kC1:"Ciclo 1", kC1s:"días primer retiro",
    kC2:"Ciclo 2+", kC2s:"días recurrente",
    kBuf:"Buffer post-retiro", kBufSuf:"del trigger",
    kFacc:"Fondeo/acc/mes", kLacc:"Vivo/acc/mes",
    kXF:"× fondeo", kXL:"× vivo",
    kUp:"Upgrade al ir a vivo", kSS:"estado estable",
    // sistema sections & rows
    secFunded:"Fase Fondeada", secLive:"Fase En Vivo",
    rC1:"Ciclo 1 (sin buffer)", rC2:"Ciclo 2+ (con buffer)",
    rWAmt:"Retiro/ciclo", rBuf:"Buffer tras retiro",
    rInc1:"Income mes 1/acc", rInc2:"Income mes 2+/acc",
    rNeed: g=>`Cuentas para ${fmtK(g)}/mes`,
    rLBuf:"Buffer a construir", rLDays:"Días building buffer",
    rLDay:"Retiro diario", rLI1:"Income mes 1/acc", rLI2:"Income mes 2+/acc",
    rLUp:"Upgrade vs fondeo",
    sysNote: (accs,live,net,hr,roi,goal,mo) =>
      `Endgame con ${accs} cuentas en vivo: ${fmt(live)}/mes · ${fmt(net)}/mes neto · $${Math.round(hr)}/hora efectiva · ${Math.round(roi)}% ROI sobre fees. Supera la meta de ${fmtK(goal)} desde el mes ${mo}.`,
    // varianza
    vTitle:"500 simulaciones Monte Carlo, fase fondeada",
    vRun:"↻ Re-ejecutar", vRunning:"Simulando…",
    vWinRate:"Win rate (días ganadores)", vAvgLoss:"Pérdida media día malo",
    vDDDay:"DD diario límite", vDDTot:"DD total límite",
    vkBlown:"Cuentas reventadas", vkSurv:"Supervivencia",
    vkDays:"Días P50 (mediana)", vkVsP:"vs plan perfecto",
    vkP50:"Income P50", vkP10:"Income P10", vkP90:"Income P90",
    vkEvt:"Eventos DD diario",
    vH1:"Distribución income (fase fondeo)",
    vH2:"Distribución días hasta graduación",
    vP10:"P10 pesimista", vP50:"P50 mediana", vP90:"P90 optimista",
    vRPerfect:"Escenario perfecto", vRMedian:"Mediana realista (P50)",
    vRHard:"Caso difícil (P90)", vRMargin:"Margen extra",
    vNoSim:"Pulsa Re-ejecutar para correr la simulación",
    vNote: (pct,wr,loss,med,ideal,fee) =>
      `${pct<5?"✓ Riesgo bajo":pct<15?"⚠ Riesgo moderado":"⛔ Riesgo alto"}, ${pct.toFixed(1)}% de blow-ups con ${wr}% win rate y pérdida media de ${fmt(loss)}/día malo. Escenario realista (P50): ${fmt(med)} por cuenta. En el peor caso (P10), ${(med/fee).toFixed(1)}× el fee de evaluación.`,
    // riesgo
    rkTitle:"Riesgo de quema (por cuenta)",
    rkProb:"PROB. REVENTAR EN FASE FONDEO",
    rkSurv:"Prob. supervivencia",
    rkBY:"Cuentas blow/año (est)",
    rkCost:"Costo blow-up",
    rkCostY:"Costo anual blows (est)",
    rkInc:"Income antes de blow",
    rkRatio:"Ratio income vs fee",
    rkDDTitle:"Análisis del DD diario",
    rkAvail:"DD diario disponible",
    rkTarget:"Objetivo/día (avg)",
    rkUse:"Uso del DD días buenos",
    rkMargin:"Margen de seguridad",
    rkToDD:"Días malos para DD diario",
    rkToTot:"Días malos para DD total",
    rkTrades:"Trades $160 para DD diario",
    rkNote: (n,l) =>`Con trades de $120–$200 necesitas ${n} pérdidas consecutivas de ${fmt(l)} para reventar el DD diario. Prácticamente imposible con disciplina básica.`,
    rkPort:"Riesgo del portfolio",
    rkInvTot:"Inversión total fees",
    rkIncF:"Income fondeo (P50)",
    rkIncAnn:"Income anual vivo",
    rkROI:"ROI sobre evaluaciones",
    rkBreak:"Break-even inversión",
    rkRatioPort:"Costo 1 blow vs income",
    rkPortNote: (inv,mo,p) =>`Tu inversión de ${fmt(inv)} se recupera en ${mo.toFixed(1)} meses. Incluso con el ${p.toFixed(1)}% de blow-ups el sistema es ampliamente rentable.`,
    rkNoSim:"Ve a la tab Varianza y ejecuta la simulación primero.",
    // neto
    nTitle:"Costos y fiscalidad",
    nFee:"Fee evaluación/cuenta", nPlat:"Plataforma + datos/mes",
    nOther:"Otros gastos/mes", nTax:"Tasa impuestos (%)", nHours:"Horas trading/día",
    nBreak:"P&L mensual real, fase vivo",
    nGross:"Ingreso bruto",
    nFeeRow: (v)=>`Fees evaluación amortizados (~${fmtK(v)})`,
    nPlatRow: (v)=>`Plataforma y datos (${fmt(v)})`,
    nOthRow: (v)=>`Otros gastos (${fmt(v)})`,
    nTaxBase:"BASE IMPONIBLE",
    nTaxRow: (r)=>`Impuestos ${r}%`,
    nNetRow:"NETO REAL / MES",
    kNetM:"Neto mensual", kNetA:"Neto anual",
    kHourly:"$/hora efectiva", kROI:"ROI sobre fees",
    kEffRate:"Tasa real total", kBE:"Break-even",
    nNote:"Los fees de evaluación, plataforma y datos son típicamente deducibles como gastos de negocio. Consulta con un contador especializado en traders independientes.",
    // pipeline
    pEval:"evaluación", pFund:"fondeo", pLive:"vivo",
    pIncLabel:"INCOME/MES",
    pAdd:"+ Añadir cuenta",
    pEmpty:"No hay cuentas. Pulsa + Añadir para empezar.",
    pSummary:"Resumen del portfolio",
    pTotal:"Total cuentas", pInEval:"En evaluación",
    pInFund:"En fondeo", pInLive:"En vivo",
    pTotalInc:"Income total/mes", pVsGoal:"vs Meta",
    // account card
    acPnl:"P&L ACTUAL", acW:"RETIROS", acCont:"CONTRIB/MES",
    acCycle:"Ciclo actual", acBuf:"Buffer",
    acProg:"Retiros → graduación",
    acDW: n=>`~${n}d retiro`, acDL: n=>`~${n}d → vivo`,
    acReady:"¡Listo para retirar!",
    acDayFmt: v=>`${fmt(v)}/día`, acBufOk:"Buffer ✓",
    acInEval:"En evaluación",
    // modal
    mTitle:"Cuenta", mName:"Nombre", mFirm:"Propfirm", mPhase:"Fase",
    mPhE:"EVAL", mPhF:"FONDEO", mPhL:"VIVO",
    mPnl:"P&L actual ($)", mWCount:"Retiros hechos",
    mGrad:"Retiros → vivo", mTrig:"Trigger ($)",
    mWAmt:"Retiro ($)", mTarget:"Objetivo diario",
    mColor:"Color", mSave:"GUARDAR", mCancel:"CANCELAR",
    // misc
    ofGoal:"de meta", stableState:"estado estable",
    daysExtra: n=>`+${n}d`,
    blownOf: (n,tot)=>`${n} de ${tot} sims`,
    consecutiveL: n=>`~${n}× perdedores seguidos`,
    retiroOf: (a,b)=>`${a}/${b}`,
    // New keys for computed accounts
    paraLlegar:"Para llegar a",
    necesitas:"necesitas",
    enFondeo:"en fase fondeada",
    enVivo:"una vez en vivo",
    recFunded:"Cuentas fondeadas (recomendado)",
    recLive:"Cuentas en vivo (endgame)",
    mesInicio:"Mes 1 / cuenta",
    mesEstable:"Mes 2+ / cuenta",
    c1Label:"Días ciclo 1 (real, con varianza)",
    c2Label:"Días ciclo 2+ (real, con varianza)",
    fmtDias: v=>`${v} días`,
    howCalc:"¿Cómo se calcula?",
    calcExplain: (c1,c2,tDays,wAmt,c1inc,c2inc,goal) =>
      `Ciclo 1: ${c1}d → ${fmt(wAmt)}. Ciclos siguientes: ${c2}d → ${fmt(wAmt)}. En ${tDays} días hábiles: mes 1 genera ${fmt(c1inc)}/cuenta, mes 2+ genera ${fmt(c2inc)}/cuenta.`,
    accsM1label:"Para cubrir mes 1",
    accsM2label:"Para cubrir mes 2+",
    accsRecLabel:"RECOMENDADO (cubre ambos)",
  },
  en: {
    langBtn:"🇪🇸 ES", title:"Propfirm System Calculator",
    subtitle:"Free. How many accounts to hit your goal, blow-up risk (Monte Carlo), and real net after fees and tax.",
    hFunded:"Funded/mo", hLive:"Live/mo", hNet:"Net/mo", hPipeline:"Pipeline",
    phEval:"EVALUATION", phFunded:"FUNDED", phLive:"LIVE",
    tabSys:"System", tabVar:"Variance", tabRisk:"Risk", tabNet:"Net P&L", tabPipe:"Pipeline",
    pDailyMin:"Min daily gain", pDailyMax:"Max daily gain",
    pWithdraw:"Withdrawal / event", pTrigger:"Withdrawal trigger",
    pGraduate:"Withdrawals before live", pAccs:"Total accounts",
    pGoal:"Monthly goal", pLiveDaily:"Daily withdrawal (live)",
    fmtGrad: v=>`${v} withdrawals`, fmtAccs: v=>`${v} accounts`, fmtH: v=>`${v}h`, fmtPct: v=>`${v}%`,
    // propfirm presets
    psLabel:"Load preset", psFirm:"Firm", psSize:"Size", psCustom:"Custom",
    psApplied: f=>`✓ ${f} loaded`, psNote:"Starting point: evaluation rules (target, drawdown, fee). They change often; verify with your firm. Updated Aug 2026.",
    shareBtn:"🔗 Share", shareOk:"✓ Link copied", shareFail:"Couldn't copy",
    kC1:"Cycle 1", kC1s:"days to first withdrawal",
    kC2:"Cycle 2+", kC2s:"days recurring",
    kBuf:"Post-withdrawal buffer", kBufSuf:"of trigger",
    kFacc:"Funded/acc/mo", kLacc:"Live/acc/mo",
    kXF:"× funded", kXL:"× live",
    kUp:"Live upgrade", kSS:"steady state",
    secFunded:"Funded Phase", secLive:"Live Account Phase",
    rC1:"Cycle 1 (no buffer)", rC2:"Cycle 2+ (with buffer)",
    rWAmt:"Withdrawal/cycle", rBuf:"Buffer after withdrawal",
    rInc1:"Month 1 income/acc", rInc2:"Month 2+ income/acc",
    rNeed: g=>`Accounts for ${fmtK(g)}/mo`,
    rLBuf:"Buffer to build", rLDays:"Days building buffer",
    rLDay:"Daily withdrawal", rLI1:"Month 1 income/acc", rLI2:"Month 2+ income/acc",
    rLUp:"Upgrade vs funded",
    sysNote: (accs,live,net,hr,roi,goal,mo) =>
      `Endgame with ${accs} live accounts: ${fmt(live)}/mo · ${fmt(net)}/mo net · $${Math.round(hr)}/effective hour · ${Math.round(roi)}% annual ROI on fees. Exceeds ${fmtK(goal)} goal from month ${mo}.`,
    vTitle:"500 Monte Carlo simulations, funded phase",
    vRun:"↻ Run again", vRunning:"Simulating…",
    vWinRate:"Win rate (winning days)", vAvgLoss:"Avg loss on bad days",
    vDDDay:"Daily DD limit", vDDTot:"Total DD limit",
    vkBlown:"Blown accounts", vkSurv:"Survival rate",
    vkDays:"Days P50 (median)", vkVsP:"vs perfect plan",
    vkP50:"Income P50", vkP10:"Income P10", vkP90:"Income P90",
    vkEvt:"Daily DD events",
    vH1:"Income distribution (funded phase)",
    vH2:"Days-to-graduation distribution",
    vP10:"P10 pessimistic", vP50:"P50 median", vP90:"P90 optimistic",
    vRPerfect:"Perfect scenario", vRMedian:"Realistic median (P50)",
    vRHard:"Hard case (P90)", vRMargin:"Extra margin",
    vNoSim:"Click Run again to start the simulation",
    vNote: (pct,wr,loss,med,ideal,fee) =>
      `${pct<5?"✓ Low risk":pct<15?"⚠ Moderate risk":"⛔ High risk"}, ${pct.toFixed(1)}% blow-ups with ${wr}% win rate and avg loss of ${fmt(loss)}/bad day. Realistic scenario (P50): ${fmt(med)} per account. Even in the worst case (P10), ${(med/fee).toFixed(1)}× the evaluation fee.`,
    rkTitle:"Blow-up risk (per account)",
    rkProb:"PROB. OF BLOWING IN FUNDED PHASE",
    rkSurv:"Survival probability",
    rkBY:"Blown accounts/year (est)",
    rkCost:"Blow-up cost",
    rkCostY:"Annual blow cost (est)",
    rkInc:"Income before blow",
    rkRatio:"Income vs fee ratio",
    rkDDTitle:"Daily DD analysis",
    rkAvail:"Daily DD available",
    rkTarget:"Your daily target (avg)",
    rkUse:"DD usage on good days",
    rkMargin:"Safety margin",
    rkToDD:"Bad days to daily DD",
    rkToTot:"Bad days to total DD",
    rkTrades:"$160 trades to daily DD",
    rkNote: (n,l) =>`With $120–$200 trades you need ${n} consecutive losses of ${fmt(l)} to hit the daily DD limit. Virtually impossible with basic discipline.`,
    rkPort:"Portfolio risk",
    rkInvTot:"Total fee investment",
    rkIncF:"Funded income (P50)",
    rkIncAnn:"Annual live income",
    rkROI:"ROI on evaluations",
    rkBreak:"Break-even investment",
    rkRatioPort:"Blow cost vs income",
    rkPortNote: (inv,mo,p) =>`Your ${fmt(inv)} investment is recovered in ${mo.toFixed(1)} months. Even with ${p.toFixed(1)}% blow-ups the system remains highly profitable.`,
    rkNoSim:"Go to the Variance tab and run the simulation first.",
    nTitle:"Costs & Tax",
    nFee:"Evaluation fee/account", nPlat:"Platform + data/month",
    nOther:"Other expenses/month", nTax:"Tax rate (%)", nHours:"Trading hours/day",
    nBreak:"Monthly real P&L, live phase",
    nGross:"Gross income",
    nFeeRow: (v)=>`Evaluation fees (amortized, ~${fmtK(v)})`,
    nPlatRow: (v)=>`Platform and data (${fmt(v)})`,
    nOthRow: (v)=>`Other expenses (${fmt(v)})`,
    nTaxBase:"TAXABLE INCOME",
    nTaxRow: (r)=>`Taxes ${r}%`,
    nNetRow:"NET / MONTH",
    kNetM:"Net monthly", kNetA:"Net annual",
    kHourly:"$/effective hour", kROI:"ROI on fees",
    kEffRate:"Total effective rate", kBE:"Break-even",
    nNote:"Evaluation fees, platform and data costs are typically deductible as business expenses. Consult with an accountant who specializes in independent traders.",
    pEval:"evaluation", pFund:"funded", pLive:"live",
    pIncLabel:"INCOME/MO",
    pAdd:"+ Add account",
    pEmpty:"No accounts. Click + Add to get started.",
    pSummary:"Portfolio summary",
    pTotal:"Total accounts", pInEval:"In evaluation",
    pInFund:"Funded", pInLive:"Live",
    pTotalInc:"Total income/mo", pVsGoal:"vs Goal",
    acPnl:"CURRENT P&L", acW:"WITHDRAWALS", acCont:"CONTRIB/MO",
    acCycle:"Current cycle", acBuf:"Buffer",
    acProg:"Withdrawals → graduation",
    acDW: n=>`~${n}d withdrawal`, acDL: n=>`~${n}d → live`,
    acReady:"Ready to withdraw!",
    acDayFmt: v=>`${fmt(v)}/day`, acBufOk:"Buffer ✓",
    acInEval:"In evaluation",
    mTitle:"Account", mName:"Name", mFirm:"Prop Firm", mPhase:"Phase",
    mPhE:"EVAL", mPhF:"FUNDED", mPhL:"LIVE",
    mPnl:"Current P&L ($)", mWCount:"Completed withdrawals",
    mGrad:"Withdrawals → live", mTrig:"Trigger ($)",
    mWAmt:"Withdrawal ($)", mTarget:"Daily target",
    mColor:"Color", mSave:"SAVE", mCancel:"CANCEL",
    ofGoal:"of goal", stableState:"steady state",
    daysExtra: n=>`+${n}d`,
    blownOf: (n,tot)=>`${n} of ${tot} sims`,
    consecutiveL: n=>`~${n}× consecutive losers`,
    retiroOf: (a,b)=>`${a}/${b}`,
    paraLlegar:"To reach",
    necesitas:"you need",
    enFondeo:"in funded phase",
    enVivo:"once live",
    recFunded:"Funded accounts (recommended)",
    recLive:"Live accounts (endgame)",
    mesInicio:"Month 1 / account",
    mesEstable:"Month 2+ / account",
    c1Label:"Cycle 1 days (real, with variance)",
    c2Label:"Cycle 2+ days (real, with variance)",
    fmtDias: v=>`${v} days`,
    howCalc:"How is this calculated?",
    calcExplain: (c1,c2,tDays,wAmt,c1inc,c2inc,goal) =>
      `Cycle 1: ${c1}d → ${fmt(wAmt)}. Subsequent: ${c2}d → ${fmt(wAmt)}. In ${tDays} trading days: month 1 generates ${fmt(c1inc)}/account, month 2+ generates ${fmt(c2inc)}/account.`,
    accsM1label:"To cover month 1",
    accsM2label:"To cover month 2+",
    accsRecLabel:"RECOMMENDED (covers both)",
  },
};

// ─── MONTE CARLO ─────────────────────────────────────────────────────────────
function runMC({ dailyMin,dailyMax,winRate,avgLoss,triggerPnl,withdrawAmt,bufferAfter,graduateAt,dailyDDLimit,totalDDLimit,N=500 }) {
  const results = [];
  for (let s=0;s<N;s++) {
    let pnl=0, withdrawals=0, totalIncome=0, days=0, blown=false, ddHits=0;
    while (withdrawals<graduateAt && days<120) {
      const r = Math.random();
      let dayPnl;
      if (r < winRate) { dayPnl = dailyMin*0.4 + Math.random()*(dailyMax*1.6-dailyMin*0.4); }
      else if (r < winRate+(1-winRate)*0.60) { dayPnl = -(30+Math.random()*avgLoss*1.4); }
      else { dayPnl = -(avgLoss*1.4+Math.random()*(dailyDDLimit*0.9-avgLoss*1.4)); }
      if (dayPnl < -dailyDDLimit) { dayPnl=-dailyDDLimit; ddHits++; blown=true; break; }
      pnl += dayPnl; days++;
      if (pnl < -totalDDLimit) { blown=true; break; }
      if (pnl >= triggerPnl) { withdrawals++; totalIncome+=withdrawAmt; pnl=bufferAfter; }
    }
    results.push({ days,withdrawals,totalIncome,blown,ddHits });
  }
  const survivors=results.filter(r=>!r.blown);
  const blown_n=results.filter(r=>r.blown).length;
  const sd=survivors.map(r=>r.days).sort((a,b)=>a-b);
  const si=survivors.map(r=>r.totalIncome).sort((a,b)=>a-b);
  const p=(arr,pct)=>arr[Math.max(0,Math.floor(arr.length*pct/100)-1)]||0;
  const incomeHist={},daysHist={};
  survivors.forEach(r=>{
    const ib=Math.floor(r.totalIncome/500)*500; incomeHist[ib]=(incomeHist[ib]||0)+1;
    const db=Math.floor(r.days/5)*5; daysHist[db]=(daysHist[db]||0)+1;
  });
  return { N,blown_n,blownPct:(blown_n/N)*100,survivors:survivors.length,
    medianDays:p(sd,50),p10Days:p(sd,10),p90Days:p(sd,90),
    medianIncome:p(si,50),p10Income:p(si,10),p90Income:p(si,90),
    incomeHist,daysHist,totalDDEvents:results.reduce((s,r)=>s+r.ddHits,0) };
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
function Slider({ label,min,max,step,value,onChange,color=C.green,fmtFn=fmt }) {
  const p=clamp((value-min)/(max-min)*100,0,100);
  return (
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style={{fontSize:11,fontWeight:600,color:C.muted,letterSpacing:"0.7px",textTransform:"uppercase"}}>{label}</span>
        <span style={{fontSize:13,fontWeight:700,color,fontFamily:"monospace"}}>{fmtFn(value)}</span>
      </div>
      <div style={{position:"relative",height:4,background:C.dim,borderRadius:2}}>
        <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${p}%`,background:color,borderRadius:2}}/>
        <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}
          style={{position:"absolute",top:-8,left:0,width:"100%",height:20,opacity:0,cursor:"pointer",margin:0}}/>
        <div style={{position:"absolute",top:-5,left:`calc(${p}% - 7px)`,width:14,height:14,borderRadius:"50%",background:color,border:`2px solid ${C.card}`,boxShadow:`0 0 8px ${color}70`,pointerEvents:"none"}}/>
      </div>
    </div>
  );
}
function KPICard({ label,value,sub,color=C.text,size=18,accent }) {
  return (
    <div style={{background:`linear-gradient(180deg, ${C.card}, ${C.card2})`,border:`1px solid ${accent||C.border}`,borderRadius:9,padding:"14px 16px",boxShadow:`inset 0 1px 0 rgba(255,255,255,0.05), 0 12px 26px -22px ${color}`}}>
      <div style={{fontSize:10,fontWeight:600,color:C.muted,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:5}}>{label}</div>
      <div style={{fontSize:size,fontWeight:800,color,fontFamily:"monospace",lineHeight:1,textShadow:`0 0 20px ${color}44`}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:C.muted,marginTop:5,lineHeight:1.4}}>{sub}</div>}
    </div>
  );
}
function Tag({ children,color=C.green }) {
  return <span style={{display:"inline-block",padding:"2px 9px",background:color+"18",color,border:`1px solid ${color}40`,borderRadius:4,fontSize:11,fontWeight:700}}>{children}</span>;
}
function PhaseBadge({ phase,t }) {
  const map={eval:{l:t.phEval,c:C.blue},funded:{l:t.phFunded,c:C.gold},live:{l:t.phLive,c:C.green}};
  const {l,c}=map[phase]||map.eval;
  return <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"2px 9px",background:c+"18",border:`1px solid ${c}40`,borderRadius:4,fontSize:10,fontWeight:700,color:c,letterSpacing:"0.6px"}}>
    <span style={{width:5,height:5,borderRadius:"50%",background:c,boxShadow:`0 0 4px ${c}`}}/>{l}
  </span>;
}
function Row({ label,value,color=C.text }) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
      <span style={{color:C.muted,fontSize:12}}>{label}</span>
      <span style={{fontFamily:"monospace",fontWeight:700,color,fontSize:13}}>{value}</span>
    </div>
  );
}
function Histogram({ data,color }) {
  const entries=Object.entries(data).map(([k,v])=>({k:Number(k),v})).sort((a,b)=>a.k-b.k);
  if (!entries.length) return <div style={{height:70,display:"flex",alignItems:"center",justifyContent:"center",color:C.muted,fontSize:12}}>–</div>;
  const maxV=Math.max(...entries.map(e=>e.v),1);
  return (
    <div>
      <div style={{display:"flex",alignItems:"flex-end",gap:2,height:65,marginBottom:4}}>
        {entries.map(({v},i)=><motion.div key={i} initial={{height:0}} animate={{height:`${(v/maxV)*60}px`}} transition={{duration:0.4,delay:i*0.015,ease:"easeOut"}} style={{flex:1,background:`linear-gradient(180deg, ${color}, ${color}44)`,borderRadius:"3px 3px 0 0",boxShadow:`0 0 9px -3px ${color}, inset 0 1px 0 ${color}`,minWidth:3}}/>)}
      </div>
      <div style={{display:"flex",gap:2}}>
        {entries.map(({k},i)=><div key={i} style={{flex:1,textAlign:"center",fontSize:8,color:C.dim,overflow:"hidden",minWidth:3}}>{k>=1000?`$${k/1000}k`:k}</div>)}
      </div>
    </div>
  );
}

// ─── PIPELINE COMPONENTS ─────────────────────────────────────────────────────
const FIRMS=["FTMO","MyFundedFutures","TopStep","Apex","The Funded Trader","Other"];
const ACC_COLORS=["#00e5a0","#a78bfa","#f5c842","#4f8eff","#fb923c","#ff4d6a","#22d3ee","#4ade80"];

// Evaluation-rule presets for the main futures prop firms (NQ/ES traders).
// {target: profit target, trailDD: trailing/total drawdown, dailyDD: daily loss limit
//  (= trailing DD for firms with no hard daily cap), fee: approx monthly eval fee USD}.
// Starting points only, rules change often. Verified Aug 2026.
const PRESETS={
  "Apex":{ order:["25K","50K","100K","150K","250K"], sizes:{
    "25K": {target:1500, trailDD:1500, dailyDD:625,  fee:147},
    "50K": {target:3000, trailDD:2500, dailyDD:1000, fee:167},
    "100K":{target:6000, trailDD:3000, dailyDD:2000, fee:207},
    "150K":{target:9000, trailDD:5000, dailyDD:3000, fee:297},
    "250K":{target:15000,trailDD:6500, dailyDD:4500, fee:517},
  }},
  "TopStep":{ order:["50K","100K","150K"], sizes:{
    "50K": {target:3000, trailDD:2000, dailyDD:1000, fee:49},
    "100K":{target:6000, trailDD:3000, dailyDD:2000, fee:99},
    "150K":{target:9000, trailDD:4500, dailyDD:3000, fee:149},
  }},
  "MyFundedFutures":{ order:["50K","100K","150K"], sizes:{
    "50K": {target:3000, trailDD:2000, dailyDD:2000, fee:80},
    "100K":{target:6000, trailDD:3000, dailyDD:3000, fee:150},
    "150K":{target:9000, trailDD:4500, dailyDD:4500, fee:265},
  }},
  "Take Profit Trader":{ order:["25K","50K","100K","150K"], sizes:{
    "25K": {target:1500, trailDD:1000, dailyDD:1000, fee:90},
    "50K": {target:3000, trailDD:2000, dailyDD:2000, fee:119},
    "100K":{target:6000, trailDD:4000, dailyDD:4000, fee:231},
    "150K":{target:9000, trailDD:6000, dailyDD:6000, fee:252},
  }},
};
const PRESET_FIRMS=Object.keys(PRESETS);
const newAcc=()=>({id:Date.now(),name:"New account",firm:"FTMO",phase:"funded",withdrawalCount:0,currentPnl:0,color:ACC_COLORS[0],dailyTarget:350,graduateAt:4,triggerPnl:4000,withdrawAmt:1350});

function AccountCard({ acc,onEdit,onDelete,liveBuffer,tradingDays,t }) {
  const bufferAfter=acc.triggerPnl-acc.withdrawAmt;
  const da=acc.dailyTarget;
  const daysToNext=acc.phase==="live"?Math.max(0,Math.ceil((liveBuffer-Math.max(0,acc.currentPnl))/da)):Math.ceil(Math.max(0,acc.triggerPnl-acc.currentPnl)/da);
  const daysToGrad=acc.phase!=="funded"?0:Math.ceil(((acc.graduateAt-acc.withdrawalCount)*acc.withdrawAmt-Math.max(0,acc.currentPnl-bufferAfter))/da);
  const cycleP=acc.phase==="funded"?clamp((acc.currentPnl-(acc.withdrawalCount>0?bufferAfter:0))/(acc.triggerPnl-(acc.withdrawalCount>0?bufferAfter:0))*100,0,100):acc.phase==="live"?clamp(acc.currentPnl/liveBuffer*100,0,100):0;
  const wP=acc.phase==="funded"?clamp(acc.withdrawalCount/acc.graduateAt*100,0,100):100;
  const mc=acc.phase==="live"?acc.dailyTarget*tradingDays:acc.phase==="funded"?Math.floor(tradingDays/Math.ceil(acc.withdrawAmt/acc.dailyTarget))*acc.withdrawAmt:0;
  return (
    <div style={{background:C.card,border:`1px solid ${acc.color}45`,borderRadius:10,padding:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:acc.color,boxShadow:`0 0 7px ${acc.color}`,flexShrink:0}}/>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{acc.name}</div>
            <div style={{fontSize:11,color:C.muted}}>{acc.firm}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:5,alignItems:"center"}}>
          <PhaseBadge phase={acc.phase} t={t}/>
          <button onClick={()=>onEdit(acc)} style={{background:"none",border:`1px solid ${C.border}`,color:C.muted,padding:"3px 9px",cursor:"pointer",fontFamily:"inherit",fontSize:11,borderRadius:4}}>✎</button>
          <button onClick={()=>onDelete(acc.id)} style={{background:"none",border:`1px solid ${C.red}30`,color:C.red,padding:"3px 8px",cursor:"pointer",fontFamily:"inherit",fontSize:11,borderRadius:4}}>✕</button>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
        <div>
          <div style={{fontSize:10,color:C.muted,fontWeight:600,letterSpacing:"0.7px",marginBottom:2}}>{t.acPnl}</div>
          <div style={{fontSize:22,fontWeight:800,fontFamily:"monospace",color:acc.currentPnl>=0?C.green:C.red}}>{fmt(acc.currentPnl)}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:600,letterSpacing:"0.7px",marginBottom:2}}>{acc.phase==="funded"?t.acW:t.acCont}</div>
          <div style={{fontSize:22,fontWeight:800,fontFamily:"monospace",color:acc.color}}>
            {acc.phase==="funded"?t.retiroOf(acc.withdrawalCount,acc.graduateAt):fmtK(mc)}
          </div>
        </div>
      </div>
      {acc.phase!=="eval"&&(
        <>
          <div style={{marginBottom:6}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginBottom:3}}>
              <span>{acc.phase==="funded"?t.acCycle:t.acBuf}</span><span>{cycleP.toFixed(0)}%</span>
            </div>
            <div style={{height:4,background:C.dim,borderRadius:2}}><div style={{height:"100%",width:`${cycleP}%`,background:acc.color,borderRadius:2}}/></div>
          </div>
          {acc.phase==="funded"&&(
            <div style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginBottom:3}}>
                <span>{t.acProg}</span><span>{wP.toFixed(0)}%</span>
              </div>
              <div style={{height:4,background:C.dim,borderRadius:2}}><div style={{height:"100%",width:`${wP}%`,background:C.orange,borderRadius:2}}/></div>
            </div>
          )}
        </>
      )}
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:8}}>
        {acc.phase==="funded"&&daysToNext>0&&<Tag color={C.gold}>{t.acDW(daysToNext)}</Tag>}
        {acc.phase==="funded"&&daysToGrad>0&&<Tag color={C.orange}>{t.acDL(daysToGrad)}</Tag>}
        {acc.phase==="funded"&&acc.currentPnl>=acc.triggerPnl&&<Tag color={C.green}>{t.acReady}</Tag>}
        {acc.phase==="live"&&<Tag color={C.green}>{t.acDayFmt(acc.dailyTarget)}</Tag>}
        {acc.phase==="live"&&daysToNext===0&&<Tag color={C.green}>{t.acBufOk}</Tag>}
        {acc.phase==="eval"&&<Tag color={C.blue}>{t.acInEval}</Tag>}
      </div>
    </div>
  );
}

function EditModal({ acc,onSave,onClose,t }) {
  const [f,setF]=useState({...acc});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const field=(label,key,type="text")=>(
    <div key={key} style={{marginBottom:11}}>
      <div style={{fontSize:10,fontWeight:600,color:C.muted,letterSpacing:"0.7px",textTransform:"uppercase",marginBottom:4}}>{label}</div>
      <input type={type} value={f[key]} onChange={e=>set(key,type==="number"?Number(e.target.value):e.target.value)}
        style={{background:C.card2,border:`1px solid ${C.border2}`,color:"#fff",padding:"8px 12px",fontFamily:"inherit",fontSize:13,width:"100%",outline:"none",borderRadius:6}}/>
    </div>
  );
  const phaseMap={eval:[t.mPhE,C.blue],funded:[t.mPhF,C.gold],live:[t.mPhL,C.green]};
  return (
    <div style={{position:"fixed",inset:0,background:"#000000d0",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:C.card,border:`1px solid ${C.border2}`,borderRadius:12,padding:22,width:"min(460px,100%)",maxHeight:"88vh",overflow:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <span style={{fontSize:15,fontWeight:700,color:"#fff"}}>{t.mTitle}</span>
          <button onClick={onClose} style={{background:"none",border:`1px solid ${C.border}`,color:C.muted,padding:"3px 10px",cursor:"pointer",fontFamily:"inherit",fontSize:12,borderRadius:4}}>✕</button>
        </div>
        {field(t.mName,"name")}
        <div style={{marginBottom:11}}>
          <div style={{fontSize:10,fontWeight:600,color:C.muted,letterSpacing:"0.7px",textTransform:"uppercase",marginBottom:4}}>{t.mFirm}</div>
          <select value={f.firm} onChange={e=>set("firm",e.target.value)}
            style={{background:C.card2,border:`1px solid ${C.border2}`,color:"#fff",padding:"8px 12px",fontFamily:"inherit",fontSize:13,width:"100%",outline:"none",borderRadius:6}}>
            {FIRMS.map(x=><option key={x}>{x}</option>)}
          </select>
        </div>
        <div style={{marginBottom:11}}>
          <div style={{fontSize:10,fontWeight:600,color:C.muted,letterSpacing:"0.7px",textTransform:"uppercase",marginBottom:6}}>{t.mPhase}</div>
          <div style={{display:"flex",gap:6}}>
            {["eval","funded","live"].map(p=>{const [l,c]=phaseMap[p];return(
              <div key={p} onClick={()=>set("phase",p)} style={{flex:1,padding:"8px 4px",textAlign:"center",cursor:"pointer",border:`1px solid ${f.phase===p?c:C.border}`,background:f.phase===p?c+"18":"transparent",borderRadius:6,fontSize:11,fontWeight:700,color:f.phase===p?c:C.muted}}>{l}</div>
            );})}
          </div>
        </div>
        <div className="gform">
          {[[t.mPnl,"currentPnl","number"],[t.mWCount,"withdrawalCount","number"],[t.mGrad,"graduateAt","number"],[t.mTrig,"triggerPnl","number"],[t.mWAmt,"withdrawAmt","number"],[t.mTarget,"dailyTarget","number"]].map(([l,k,tp])=>field(l,k,tp))}
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:600,color:C.muted,letterSpacing:"0.7px",textTransform:"uppercase",marginBottom:8}}>{t.mColor}</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {ACC_COLORS.map(c=><div key={c} onClick={()=>set("color",c)} style={{width:22,height:22,borderRadius:"50%",background:c,cursor:"pointer",border:`2px solid ${f.color===c?"#fff":"transparent"}`}}/>)}
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>onSave(f)} style={{flex:1,background:C.green,border:"none",color:"#05050d",padding:"10px",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,borderRadius:6}}>{t.mSave}</button>
          <button onClick={onClose} style={{background:"none",border:`1px solid ${C.border}`,color:C.muted,padding:"10px 16px",cursor:"pointer",fontFamily:"inherit",fontSize:12,borderRadius:6}}>{t.mCancel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── PERSISTENCE ─────────────────────────────────────────────────────────────
// Keeps your inputs & pipeline across refreshes (localStorage).
function usePersisted(key, init) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem("pfc_" + key); return s != null ? JSON.parse(s) : init; }
    catch (_) { return init; }
  });
  useEffect(() => { try { localStorage.setItem("pfc_" + key, JSON.stringify(v)); } catch (_) {} }, [key, v]);
  return [v, setV];
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function App() {
  const [lang,setLang]=useState("en");
  const t=T[lang];

  // ── INPUTS: lo que tú controlas ──────────────────────────────────────────────
  const [dailyMin,    setDailyMin]    = usePersisted("dailyMin", 300);
  const [dailyMax,    setDailyMax]    = usePersisted("dailyMax", 400);
  const [withdrawAmt, setWithdrawAmt] = usePersisted("withdrawAmt", 1350);
  const [triggerPnl,  setTriggerPnl]  = usePersisted("triggerPnl", 4000);
  const [c1Days,      setC1Days]      = usePersisted("c1Days", 10);
  const [c2Days,      setC2Days]      = usePersisted("c2Days", 5);
  const [tradingDays, setTradingDays] = usePersisted("tradingDays", 22);
  const [monthGoal,   setMonthGoal]   = usePersisted("monthGoal", 20000);
  const [graduateAt,  setGraduateAt]  = usePersisted("graduateAt", 4);
  const [liveBuffer,  setLiveBuffer]  = usePersisted("liveBuffer", 2500);
  const [liveWithdraw,setLiveWithdraw]= usePersisted("liveWithdraw", 350);
  // Varianza
  const [winRate,     setWinRate]     = usePersisted("winRate", 0.62);
  const [avgLoss,     setAvgLoss]     = usePersisted("avgLoss", 200);
  const [dailyDDLimit,setDailyDDLimit]= usePersisted("dailyDDLimit", 2000);
  const [totalDDLimit,setTotalDDLimit]= usePersisted("totalDDLimit", 10000);
  const [simRes,      setSimRes]      = useState(null);
  const [simRunning,  setSimRunning]  = useState(false);
  // Costos
  const [evalFee,     setEvalFee]     = usePersisted("evalFee", 350);
  const [platformCost,setPlatformCost]= usePersisted("platformCost", 150);
  const [otherCost,   setOtherCost]   = usePersisted("otherCost", 100);
  const [taxRate,     setTaxRate]     = usePersisted("taxRate", 25);
  const [hoursPerDay, setHoursPerDay] = usePersisted("hoursPerDay", 3);
  // Pipeline
  const [accounts, setAccounts] = usePersisted("accounts", [
    {id:1,name:"FTMO #1",firm:"FTMO",phase:"funded",withdrawalCount:2,currentPnl:2100,color:C.green,dailyTarget:350,graduateAt:4,triggerPnl:4000,withdrawAmt:1350},
    {id:2,name:"MFF #1",firm:"MyFundedFutures",phase:"funded",withdrawalCount:1,currentPnl:900,color:C.purple,dailyTarget:350,graduateAt:4,triggerPnl:4000,withdrawAmt:1350},
    {id:3,name:"Apex #1",firm:"Apex",phase:"eval",withdrawalCount:0,currentPnl:1500,color:C.blue,dailyTarget:350,graduateAt:4,triggerPnl:4000,withdrawAmt:1350},
    {id:4,name:"FTMO #2",firm:"FTMO",phase:"live",withdrawalCount:4,currentPnl:2800,color:C.orange,dailyTarget:350,graduateAt:4,triggerPnl:4000,withdrawAmt:1350},
    {id:5,name:"TopStep #1",firm:"TopStep",phase:"funded",withdrawalCount:3,currentPnl:3500,color:C.gold,dailyTarget:350,graduateAt:4,triggerPnl:4000,withdrawAmt:1350},
  ]);
  const [editingAcc,setEditingAcc]=useState(null);
  const [tab,setTab]=useState("sistema");
  const [preset,setPreset]=usePersisted("preset",{firm:"",size:""});

  // ── OUTPUTS: el calculator te dice cuántas cuentas necesitas ────────────────
  const dailyAvg    = (dailyMin+dailyMax)/2;
  const bufferAfter = triggerPnl-withdrawAmt;

  // Load a prop-firm evaluation preset into the relevant inputs.
  const applyPreset=(firm,size)=>{
    const p=PRESETS[firm]&&PRESETS[firm].sizes[size];
    if(!p){ setPreset({firm:"",size:""}); return; }
    setTriggerPnl(p.target);
    setTotalDDLimit(p.trailDD);
    setDailyDDLimit(p.dailyDD);
    setEvalFee(p.fee);
    setPreset({firm,size});
  };
  const psSel={background:C.card2,border:`1px solid ${C.border2}`,color:"#fff",padding:"7px 10px",fontFamily:"inherit",fontSize:12.5,outline:"none",borderRadius:6,cursor:"pointer"};

  // ── SHARE SCENARIO BY URL ────────────────────────────────────────────────
  const [shared,setShared]=useState("");
  const shareScenario=()=>{
    const data={dailyMin,dailyMax,withdrawAmt,triggerPnl,c1Days,c2Days,tradingDays,monthGoal,graduateAt,liveBuffer,liveWithdraw,winRate,avgLoss,dailyDDLimit,totalDDLimit,evalFee,platformCost,otherCost,taxRate,hoursPerDay,preset,lang};
    let url=location.href;
    try{ url=location.origin+location.pathname+"?s="+encodeURIComponent(btoa(JSON.stringify(data))); }catch(_){}
    const flash=st=>{ setShared(st); setTimeout(()=>setShared(""),2200); };
    const legacy=()=>{ try{ const ta=document.createElement("textarea"); ta.value=url; ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta); ta.focus(); ta.select(); const ok=document.execCommand("copy"); document.body.removeChild(ta); return ok; }catch(_){ return false; } };
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(url).then(()=>flash("ok"),()=>flash(legacy()?"ok":"fail")); }
    else flash(legacy()?"ok":"fail");
  };

  // Income por cuenta fondeada usando los días REALES que el usuario conoce
  const month1Fund  = (1+Math.max(0,Math.floor((tradingDays-c1Days)/c2Days)))*withdrawAmt;
  const month2Fund  = Math.floor(tradingDays/c2Days)*withdrawAmt;

  // ► CUENTAS NECESARIAS (el resultado principal)
  const accsM1  = Math.ceil(monthGoal/month1Fund);          // para cubrir mes 1
  const accsM2  = Math.ceil(monthGoal/month2Fund);          // para cubrir mes 2+
  const accsRec = Math.max(accsM1, accsM2);                 // recomendado: cubre ambos

  // Income por cuenta viva
  const liveBuffDays = Math.ceil(liveBuffer/liveWithdraw);
  const month2Live   = tradingDays*liveWithdraw;
  const accsLive     = Math.ceil(monthGoal/month2Live);     // cuentas en vivo necesarias

  // Totales del sistema con accsRec cuentas
  const stableFund     = accsRec*month2Fund;
  const stableLive     = accsRec*month2Live;
  const liveUpgradePct = ((month2Live-month2Fund)/month2Fund*100).toFixed(0);

  // Timeline hacia vivo
  const fundedTradeDays = c1Days+(graduateAt-1)*c2Days;
  const graduateMonth   = Math.ceil(fundedTradeDays/tradingDays);

  // Costos y neto
  const monthlyEvalAmort = (evalFee*accsRec)/Math.max(1,graduateMonth+2);
  const monthlyExpenses  = monthlyEvalAmort+platformCost+otherCost;
  const monthlyTaxable   = Math.max(0,stableLive-monthlyExpenses);
  const monthlyTax       = monthlyTaxable*(taxRate/100);
  const monthlyNet       = stableLive-monthlyExpenses-monthlyTax;
  const effectiveHourly  = monthlyNet/(tradingDays*hoursPerDay);
  const roiAnnual        = (monthlyNet*12)/(evalFee*accsRec)*100;
  const breakEvenMonths  = (evalFee*accsRec)/Math.max(1,monthlyNet);
  const pipelineIncome   = accounts.reduce((s,a)=>{
    if(a.phase==="live") return s+a.dailyTarget*tradingDays;
    if(a.phase==="funded") return s+Math.floor(tradingDays/Math.ceil(a.withdrawAmt/a.dailyTarget))*a.withdrawAmt;
    return s;
  },0);

  const runSim=useCallback(()=>{
    setSimRunning(true);
    setTimeout(()=>{
      const r=runMC({dailyMin,dailyMax,winRate,avgLoss,triggerPnl,withdrawAmt,bufferAfter,graduateAt,dailyDDLimit,totalDDLimit,N:500});
      setSimRes(r); setSimRunning(false);
    },10);
  },[dailyMin,dailyMax,winRate,avgLoss,triggerPnl,withdrawAmt,bufferAfter,graduateAt,dailyDDLimit,totalDDLimit]);
  useEffect(()=>{ runSim(); },[]);

  // Load a shared scenario from ?s= on first mount (overrides persisted state).
  useEffect(()=>{
    try{
      const s=new URLSearchParams(location.search).get("s"); if(!s) return;
      const d=JSON.parse(atob(decodeURIComponent(s)));
      const num=(k,setter)=>{ if(typeof d[k]==="number"&&!isNaN(d[k])) setter(d[k]); };
      num("dailyMin",setDailyMin); num("dailyMax",setDailyMax); num("withdrawAmt",setWithdrawAmt); num("triggerPnl",setTriggerPnl);
      num("c1Days",setC1Days); num("c2Days",setC2Days); num("tradingDays",setTradingDays); num("monthGoal",setMonthGoal);
      num("graduateAt",setGraduateAt); num("liveBuffer",setLiveBuffer); num("liveWithdraw",setLiveWithdraw);
      num("winRate",setWinRate); num("avgLoss",setAvgLoss); num("dailyDDLimit",setDailyDDLimit); num("totalDDLimit",setTotalDDLimit);
      num("evalFee",setEvalFee); num("platformCost",setPlatformCost); num("otherCost",setOtherCost); num("taxRate",setTaxRate); num("hoursPerDay",setHoursPerDay);
      if(d.preset&&typeof d.preset==="object") setPreset(d.preset);
      if(d.lang==="es"||d.lang==="en") setLang(d.lang);
      // Re-run the Monte Carlo with the decoded values so results match the shared inputs.
      try{ setSimRes(runMC({dailyMin:d.dailyMin,dailyMax:d.dailyMax,winRate:d.winRate,avgLoss:d.avgLoss,triggerPnl:d.triggerPnl,withdrawAmt:d.withdrawAmt,bufferAfter:d.triggerPnl-d.withdrawAmt,graduateAt:d.graduateAt,dailyDDLimit:d.dailyDDLimit,totalDDLimit:d.totalDDLimit,N:500})); }catch(_){}
      history.replaceState(null,"",location.origin+location.pathname);
    }catch(_){}
  },[]);

  const saveAcc=a=>{setAccounts(p=>p.find(x=>x.id===a.id)?p.map(x=>x.id===a.id?a:x):[...p,a]);setEditingAcc(null);};

  const TABS=[{k:"sistema",l:t.tabSys},{k:"varianza",l:t.tabVar},{k:"riesgo",l:t.tabRisk},{k:"neto",l:t.tabNet},{k:"pipeline",l:t.tabPipe}];

  return (
    <MotionConfig reducedMotion="user">
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Inter',system-ui,sans-serif",color:C.text,paddingBottom:40}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:3px;height:3px}::-webkit-scrollbar-track{background:${C.bg}}::-webkit-scrollbar-thumb{background:${C.dim};border-radius:2px}
input[type=number]{-moz-appearance:textfield}input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
/* ── Layout helpers ── */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.gneto{display:grid;grid-template-columns:320px 1fr;gap:14px}
.gform{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.hdrchips{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
/* ── Mobile ── */
@media(max-width:700px){
  .g2{grid-template-columns:1fr!important}
  .g3{grid-template-columns:1fr 1fr!important}
  .gneto{grid-template-columns:1fr!important}
  .gform{grid-template-columns:1fr!important}
  .hdrchips{overflow-x:auto;flex-wrap:nowrap;padding-bottom:3px;-webkit-overflow-scrolling:touch}
  .hdrchips>*{flex-shrink:0}
}
@media(max-width:480px){
  .g3{grid-template-columns:1fr!important}
}`}</style>
      {editingAcc&&<EditModal acc={editingAcc} onSave={saveAcc} onClose={()=>setEditingAcc(null)} t={t}/>}

      {/* HEADER */}
      <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:"13px 18px 12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
          {/* Left: title + lang + badges */}
          <div style={{flex:"1 1 auto",minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6,flexWrap:"wrap"}}>
              <div style={{fontSize:18,fontWeight:700,color:"#fff",letterSpacing:"-0.3px",fontFamily:"'Space Grotesk',sans-serif"}}>{t.title}</div>
              <button onClick={()=>setLang(l=>l==="es"?"en":"es")}
                style={{background:C.border,border:`1px solid ${C.border2}`,color:C.text,padding:"5px 11px",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,borderRadius:6,letterSpacing:"0.4px",whiteSpace:"nowrap",flexShrink:0}}>
                {t.langBtn}
              </button>
              <button onClick={shareScenario}
                style={{background:shared==="ok"?C.green:"transparent",border:`1px solid ${shared==="ok"?C.green:C.gold}`,color:shared==="ok"?"#05050d":C.gold,padding:"5px 11px",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,borderRadius:6,letterSpacing:"0.4px",whiteSpace:"nowrap",flexShrink:0,transition:"all .15s"}}>
                {shared==="ok"?t.shareOk:shared==="fail"?t.shareFail:t.shareBtn}
              </button>
            </div>
            <div style={{fontSize:12.5,color:C.muted,lineHeight:1.5,maxWidth:540,marginBottom:9}}>{t.subtitle}</div>
            <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
              <PhaseBadge phase="eval" t={t}/><span style={{color:C.dim,fontSize:11}}>→</span>
              <PhaseBadge phase="funded" t={t}/><span style={{color:C.dim,fontSize:11}}>→</span>
              <PhaseBadge phase="live" t={t}/>
            </div>
          </div>
          {/* Right: CUENTAS NECESARIAS, el resultado principal */}
          <div className="hdrchips">
            {/* Funded accounts answer */}
            <div style={{background:C.gold+"15",border:`1px solid ${C.gold}50`,borderRadius:9,padding:"8px 16px",textAlign:"center",minWidth:100}}>
              <div style={{fontSize:9,color:C.gold,fontWeight:700,letterSpacing:"0.8px",marginBottom:2,textTransform:"uppercase"}}>{t.enFondeo}</div>
              <div style={{fontSize:36,fontWeight:800,color:C.gold,fontFamily:"monospace",lineHeight:1}}>{accsRec}</div>
              <div style={{fontSize:10,color:C.muted,marginTop:2}}>{fmtK(stableFund)}/mes</div>
            </div>
            <div style={{fontSize:18,color:C.dim,alignSelf:"center"}}>→</div>
            {/* Live accounts answer */}
            <div style={{background:C.green+"15",border:`1px solid ${C.green}50`,borderRadius:9,padding:"8px 16px",textAlign:"center",minWidth:100}}>
              <div style={{fontSize:9,color:C.green,fontWeight:700,letterSpacing:"0.8px",marginBottom:2,textTransform:"uppercase"}}>{t.enVivo}</div>
              <div style={{fontSize:36,fontWeight:800,color:C.green,fontFamily:"monospace",lineHeight:1}}>{accsLive}</div>
              <div style={{fontSize:10,color:C.muted,marginTop:2}}>{fmtK(accsLive*month2Live)}/mes</div>
            </div>
            {/* Other stats */}
            {[{l:t.hNet,v:fmtK(monthlyNet),c:C.teal},{l:t.hPipeline,v:fmtK(pipelineIncome),c:C.blue}].map(({l,v,c})=>(
              <div key={l} style={{background:c+"12",border:`1px solid ${c}30`,borderRadius:7,padding:"7px 12px",textAlign:"center",minWidth:80}}>
                <div style={{fontSize:9,color:c,fontWeight:600,letterSpacing:"0.7px",marginBottom:2,textTransform:"uppercase"}}>{l}</div>
                <div style={{fontSize:16,fontWeight:800,color:c,fontFamily:"monospace"}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{padding:"16px 18px",maxWidth:1160,margin:"0 auto"}}>
        {/* PARAMS */}
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:12,paddingBottom:12,borderBottom:`1px solid ${C.border}`}}>
            <span style={{fontSize:11,fontWeight:700,color:C.gold,letterSpacing:"0.7px",textTransform:"uppercase"}}>⚡ {t.psLabel}</span>
            <select value={preset.firm} onChange={e=>{const f=e.target.value; if(!f){setPreset({firm:"",size:""});return;} applyPreset(f,PRESETS[f].order[0]);}} style={psSel}>
              <option value="">{t.psFirm}…</option>
              {PRESET_FIRMS.map(f=><option key={f} value={f}>{f}</option>)}
            </select>
            <select value={preset.size} onChange={e=>applyPreset(preset.firm,e.target.value)} disabled={!preset.firm} style={{...psSel,opacity:preset.firm?1:0.4,cursor:preset.firm?"pointer":"not-allowed"}}>
              <option value="">{t.psSize}…</option>
              {preset.firm&&PRESETS[preset.firm].order.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            {preset.firm&&preset.size&&<span style={{fontSize:11.5,color:C.green,fontWeight:600}}>{t.psApplied(preset.firm+" "+preset.size)}</span>}
            <span style={{fontSize:10.5,color:C.muted,flexBasis:"100%",lineHeight:1.5}}>{t.psNote}</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:"2px 22px"}}>
            <Slider label={t.pDailyMin} min={150} max={500} step={25} value={dailyMin} onChange={v=>setDailyMin(Math.min(v,dailyMax-25))} color={C.gold}/>
            <Slider label={t.pDailyMax} min={150} max={600} step={25} value={dailyMax} onChange={v=>setDailyMax(Math.max(v,dailyMin+25))} color={C.gold}/>
            <Slider label={t.pWithdraw} min={800} max={2000} step={50} value={withdrawAmt} onChange={setWithdrawAmt} color={C.green}/>
            <Slider label={t.pTrigger} min={1000} max={20000} step={250} value={triggerPnl} onChange={setTriggerPnl} color={C.purple}/>
            <Slider label={t.c1Label} min={7} max={20} step={1} value={c1Days} onChange={setC1Days} color={C.blue} fmtFn={t.fmtDias}/>
            <Slider label={t.c2Label} min={2} max={10} step={1} value={c2Days} onChange={setC2Days} color={C.blue} fmtFn={t.fmtDias}/>
            <Slider label={t.pGraduate} min={3} max={8} step={1} value={graduateAt} onChange={setGraduateAt} color={C.orange} fmtFn={t.fmtGrad}/>
            <Slider label={t.pGoal} min={5000} max={60000} step={1000} value={monthGoal} onChange={setMonthGoal} color={C.red}/>
          </div>
        </div>

        {/* TABS */}
        <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,marginBottom:16,overflowX:"auto"}}>
          {TABS.map(tb=>(
            <div key={tb.k} onClick={()=>setTab(tb.k)}
              style={{padding:"9px 22px",fontSize:12,fontWeight:600,letterSpacing:"0.5px",cursor:"pointer",color:tab===tb.k?C.green:C.muted,background:tab===tb.k?C.green+"10":"transparent",borderRadius:"7px 7px 0 0",borderBottom:`2px solid ${tab===tb.k?C.green:"transparent"}`,transition:"all .15s",textTransform:"uppercase",whiteSpace:"nowrap"}}>
              {tb.l}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
        <motion.div key={tab}
          initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
          transition={{duration:0.26,ease:[0.22,1,0.36,1]}}>
        {/* ══ SISTEMA ══ */}
        {tab==="sistema"&&(
          <div>
            {/* ── HERO: LA RESPUESTA ─────────────────────────────────────────── */}
            <div style={{background:"linear-gradient(135deg,#0c0f1a,#0a1020)",border:`1px solid ${C.gold}40`,borderRadius:12,padding:"22px 24px",marginBottom:16}}>
              <div style={{fontSize:11,color:C.muted,fontWeight:600,letterSpacing:"1px",textTransform:"uppercase",marginBottom:14,textAlign:"center"}}>
                {t.paraLlegar} <span style={{color:"#fff",fontFamily:"monospace"}}>{fmtK(monthGoal)}</span>/mes, {t.necesitas}:
              </div>
              <div style={{display:"flex",gap:12,justifyContent:"center",alignItems:"stretch",flexWrap:"wrap"}}>
                {/* Fase fondeada */}
                <div style={{background:C.gold+"10",border:`2px solid ${C.gold}`,borderRadius:10,padding:"18px 28px",textAlign:"center",flex:"1 1 160px",maxWidth:220}}>
                  <div style={{fontSize:10,color:C.gold,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:8}}>{t.recFunded}</div>
                  <div style={{fontSize:72,fontWeight:800,color:C.gold,fontFamily:"monospace",lineHeight:1}}>{accsRec}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:6}}>× {fmt(month2Fund)}/mes</div>
                  <div style={{fontSize:14,fontWeight:700,color:C.gold,fontFamily:"monospace",marginTop:4}}>= {fmt(stableFund)}/mes</div>
                  <div style={{marginTop:10,padding:"6px 10px",background:C.gold+"15",borderRadius:6}}>
                    <div style={{fontSize:10,color:C.muted,marginBottom:2}}>{t.mesInicio}: <span style={{color:C.gold}}>{fmt(month1Fund)}</span></div>
                    <div style={{fontSize:10,color:C.muted}}>{t.mesEstable}: <span style={{color:C.gold}}>{fmt(month2Fund)}</span></div>
                  </div>
                </div>
                {/* Arrow */}
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 4px"}}>
                  <div style={{fontSize:28,color:C.dim}}>→</div>
                  <div style={{fontSize:9,color:C.dim,letterSpacing:"0.5px",textAlign:"center",marginTop:4,maxWidth:60}}>{graduateMonth} {lang==="es"?"meses":"months"}</div>
                </div>
                {/* Fase vivo */}
                <div style={{background:C.green+"10",border:`2px solid ${C.green}`,borderRadius:10,padding:"18px 28px",textAlign:"center",flex:"1 1 160px",maxWidth:220}}>
                  <div style={{fontSize:10,color:C.green,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:8}}>{t.recLive}</div>
                  <div style={{fontSize:72,fontWeight:800,color:C.green,fontFamily:"monospace",lineHeight:1}}>{accsLive}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:6}}>× {fmt(month2Live)}/mes</div>
                  <div style={{fontSize:14,fontWeight:700,color:C.green,fontFamily:"monospace",marginTop:4}}>= {fmt(accsLive*month2Live)}/mes</div>
                  <div style={{marginTop:10,padding:"6px 10px",background:C.green+"10",borderRadius:6}}>
                    <div style={{fontSize:10,color:C.muted}}>{lang==="es"?"Retiro diario":"Daily withdrawal"}: <span style={{color:C.green}}>{fmt(liveWithdraw)}/día</span></div>
                  </div>
                </div>
                {/* Math breakdown */}
                <div style={{background:"#0a0a14",border:`1px solid ${C.border}`,borderRadius:10,padding:"16px 20px",flex:"1 1 200px",maxWidth:280}}>
                  <div style={{fontSize:10,color:C.muted,fontWeight:600,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:10}}>{t.howCalc}</div>
                  {[[t.accsM1label,`⌈${fmtK(monthGoal)} ÷ ${fmt(month1Fund)}⌉ = ${accsM1}`,C.muted],[t.accsM2label,`⌈${fmtK(monthGoal)} ÷ ${fmt(month2Fund)}⌉ = ${accsM2}`,C.muted],[t.accsRecLabel,`max(${accsM1}, ${accsM2}) = ${accsRec}`,C.gold]].map(([l,v,c])=>(
                    <div key={l} style={{marginBottom:8,paddingBottom:8,borderBottom:`1px solid ${C.border}`}}>
                      <div style={{fontSize:10,color:C.muted,marginBottom:2}}>{l}</div>
                      <div style={{fontSize:11,fontFamily:"monospace",color:c,fontWeight:600}}>{v}</div>
                    </div>
                  ))}
                  <div style={{fontSize:10,color:C.muted,lineHeight:1.7,marginTop:4}}>
                    {t.calcExplain(c1Days,c2Days,tradingDays,withdrawAmt,month1Fund,month2Fund,monthGoal)}
                  </div>
                </div>
              </div>
            </div>

            {/* ── KPI BREAKDOWN ──────────────────────────────────────────────── */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10,marginBottom:14}}>
              {[
                {l:t.kC1,v:`${c1Days}d`,c:C.blue,s:t.kC1s},
                {l:t.kC2,v:`${c2Days}d`,c:C.gold,s:t.kC2s},
                {l:t.kBuf,v:fmt(bufferAfter),c:C.purple,s:`${((bufferAfter/triggerPnl)*100).toFixed(0)}% ${t.kBufSuf}`},
                {l:t.kFacc,v:fmt(month2Fund),c:C.gold,s:`${Math.floor(tradingDays/c2Days)} retiros`},
                {l:t.kLacc,v:fmt(month2Live),c:C.green,s:`${tradingDays}d × ${fmt(liveWithdraw)}`},
                {l:`${accsRec} ${t.kXF}`,v:fmt(stableFund),c:C.gold,s:t.kSS},
                {l:`${accsLive} ${t.kXL}`,v:fmt(accsLive*month2Live),c:C.green,s:t.kSS},
                {l:t.kUp,v:`+${liveUpgradePct}%`,c:C.orange,s:t.kSS},
              ].map(({l,v,c,s})=><KPICard key={l} label={l} value={v} sub={s} color={c}/>)}
            </div>
            <div className="g2">
              {[
                {title:t.secFunded,color:C.gold,rows:[[t.rC1,`${c1Days}d`],[t.rC2,`${c2Days}d`],[t.rWAmt,fmt(withdrawAmt)],[t.rBuf,fmt(bufferAfter)],[t.rInc1,fmt(month1Fund)],[t.rInc2,fmt(month2Fund)],[t.rNeed(monthGoal),`${accsRec} ${lang==="es"?"cuentas":"accounts"}`]]},
                {title:t.secLive,color:C.green,rows:[[t.rLBuf,fmt(liveBuffer)],[t.rLDays,`${Math.round(liveBuffDays)}d`],[t.rLDay,fmt(liveWithdraw)],[t.rLI1,fmt(Math.max(0,tradingDays-liveBuffDays)*liveWithdraw)],[t.rLI2,fmt(month2Live)],[t.rLUp,`+${liveUpgradePct}%`],[t.rNeed(monthGoal),`${accsLive} ${lang==="es"?"cuentas":"accounts"}`]]},
              ].map(({title,color,rows})=>(
                <div key={title} style={{background:C.card,border:`1px solid ${color}30`,borderRadius:10,padding:18}}>
                  <div style={{fontSize:13,fontWeight:700,color,marginBottom:14}}>{title}</div>
                  {rows.map(([l,v])=><Row key={l} label={l} value={v} color={color}/>)}
                </div>
              ))}
            </div>
            <div style={{marginTop:12,background:C.green+"08",border:`1px solid ${C.green}25`,borderRadius:8,padding:"13px 17px",fontSize:13,color:C.muted,lineHeight:1.8}}>
              {t.sysNote(accsRec,stableLive,monthlyNet,effectiveHourly,roiAnnual,monthGoal,graduateMonth+2)}
            </div>
          </div>
        )}

        {/* ══ VARIANZA ══ */}
        {tab==="varianza"&&(
          <div>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:18,marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,flexWrap:"wrap",marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:"1px",textTransform:"uppercase",flex:"1 1 auto"}}>{t.vTitle}</div>
                <button onClick={runSim} disabled={simRunning}
                  style={{background:C.blue,border:"none",color:"#fff",padding:"8px 18px",cursor:simRunning?"not-allowed":"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,borderRadius:6,opacity:simRunning?0.6:1}}>
                  {simRunning?t.vRunning:t.vRun}
                </button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:"2px 22px"}}>
                <Slider label={t.vWinRate} min={40} max={85} step={1} value={Math.round(winRate*100)} onChange={v=>setWinRate(v/100)} color={C.green} fmtFn={t.fmtPct}/>
                <Slider label={t.vAvgLoss} min={50} max={600} step={25} value={avgLoss} onChange={setAvgLoss} color={C.red}/>
                <Slider label={t.vDDDay} min={500} max={6000} step={100} value={dailyDDLimit} onChange={setDailyDDLimit} color={C.red}/>
                <Slider label={t.vDDTot} min={1000} max={20000} step={250} value={totalDDLimit} onChange={setTotalDDLimit} color={C.orange}/>
              </div>
            </div>
            {simRes?(
              <>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10,marginBottom:14}}>
                  {[
                    {l:t.vkBlown,v:`${simRes.blownPct.toFixed(1)}%`,c:simRes.blownPct<5?C.green:simRes.blownPct<15?C.gold:C.red,s:t.blownOf(simRes.blown_n,500)},
                    {l:t.vkSurv,v:`${(100-simRes.blownPct).toFixed(1)}%`,c:C.green,s:""},
                    {l:t.vkDays,v:`${Math.round(simRes.medianDays)}d`,c:C.blue,s:`P10:${simRes.p10Days}d · P90:${simRes.p90Days}d`},
                    {l:t.vkVsP,v:t.daysExtra(simRes.medianDays-fundedTradeDays),c:C.muted,s:""},
                    {l:t.vkP50,v:fmt(simRes.medianIncome),c:C.gold,s:""},
                    {l:t.vkP10,v:fmt(simRes.p10Income),c:C.red,s:""},
                    {l:t.vkP90,v:fmt(simRes.p90Income),c:C.green,s:""},
                    {l:t.vkEvt,v:simRes.totalDDEvents,c:C.orange,s:""},
                  ].map(({l,v,c,s})=><KPICard key={l} label={l} value={v} sub={s} color={c} accent={c+"30"}/>)}
                </div>
                <div className="g2" style={{marginBottom:12}}>
                  <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:18}}>
                    <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:"1px",textTransform:"uppercase",marginBottom:14}}>{t.vH1}</div>
                    <Histogram data={simRes.incomeHist} color={C.gold}/>
                    <div className="g3" style={{marginTop:12}}>
                      {[[t.vP10,simRes.p10Income,C.red],[t.vP50,simRes.medianIncome,C.gold],[t.vP90,simRes.p90Income,C.green]].map(([l,v,c])=>(
                        <div key={l} style={{textAlign:"center",padding:"10px 8px",background:C.bg,borderRadius:6,border:`1px solid ${c}30`}}>
                          <div style={{fontSize:10,color:C.muted,marginBottom:3,fontWeight:600}}>{l}</div>
                          <div style={{fontSize:15,fontWeight:800,color:c,fontFamily:"monospace"}}>{fmt(v)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:18}}>
                    <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:"1px",textTransform:"uppercase",marginBottom:14}}>{t.vH2}</div>
                    <Histogram data={simRes.daysHist} color={C.blue}/>
                    <div style={{marginTop:12}}>
                      <Row label={t.vRPerfect} value={`${fundedTradeDays}d`} color={C.green}/>
                      <Row label={t.vRMedian} value={`${Math.round(simRes.medianDays)}d`} color={C.gold}/>
                      <Row label={t.vRHard} value={`${Math.round(simRes.p90Days)}d`} color={C.red}/>
                      <Row label={t.vRMargin} value={t.daysExtra(simRes.medianDays-fundedTradeDays)} color={C.muted}/>
                    </div>
                  </div>
                </div>
                <div style={{background:simRes.blownPct<10?C.green+"08":C.red+"08",border:`1px solid ${simRes.blownPct<10?C.green:C.red}25`,borderRadius:8,padding:"12px 16px",fontSize:13,color:C.muted,lineHeight:1.8}}>
                  {t.vNote(simRes.blownPct,Math.round(winRate*100),avgLoss,simRes.medianIncome,graduateAt*withdrawAmt,evalFee)}
                </div>
              </>
            ):(
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:40,textAlign:"center",color:C.muted,fontSize:13}}>
                {simRunning?t.vRunning:t.vNoSim}
              </div>
            )}
          </div>
        )}

        {/* ══ RIESGO ══ */}
        {tab==="riesgo"&&(
          <div>
            {!simRes&&<div style={{background:C.gold+"0a",border:`1px solid ${C.gold}30`,borderRadius:8,padding:"10px 16px",marginBottom:14,fontSize:13,color:C.gold}}>{t.rkNoSim}</div>}
            <div className="g2" style={{marginBottom:14}}>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:20}}>
                <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:"1px",textTransform:"uppercase",marginBottom:16}}>{t.rkTitle}</div>
                {simRes?(
                  <>
                    <div style={{textAlign:"center",marginBottom:14}}>
                      <div style={{fontSize:10,color:C.muted,fontWeight:600,letterSpacing:"0.7px",marginBottom:4}}>{t.rkProb}</div>
                      <div style={{fontSize:48,fontWeight:800,fontFamily:"monospace",color:simRes.blownPct<5?C.green:simRes.blownPct<15?C.gold:C.red,lineHeight:1}}>{simRes.blownPct.toFixed(1)}%</div>
                    </div>
                    <div style={{height:7,background:C.dim,borderRadius:4,marginBottom:14,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${Math.min(simRes.blownPct,100)}%`,background:simRes.blownPct<5?C.green:simRes.blownPct<15?C.gold:C.red,borderRadius:4}}/>
                    </div>
                    {[
                      [t.rkSurv,`${(100-simRes.blownPct).toFixed(1)}%`,C.green],
                      [t.rkBY,`${(simRes.blownPct/100*accsRec*(12/Math.max(1,fundedTradeDays/tradingDays))).toFixed(1)}`,C.red],
                      [t.rkCost,fmt(evalFee),C.gold],
                      [t.rkCostY,fmt(simRes.blownPct/100*accsRec*(12/Math.max(1,fundedTradeDays/tradingDays))*evalFee),C.orange],
                      [t.rkInc,fmt(simRes.medianIncome),C.green],
                      [t.rkRatio,`${(simRes.medianIncome/evalFee).toFixed(0)}× ${lang==="es"?"el fee":"the fee"}`,C.green],
                    ].map(([l,v,c])=><Row key={l} label={l} value={v} color={c}/>)}
                  </>
                ):<div style={{color:C.muted,fontSize:13,padding:"20px 0"}}>{t.rkNoSim}</div>}
              </div>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:20}}>
                <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:"1px",textTransform:"uppercase",marginBottom:16}}>{t.rkDDTitle}</div>
                {[
                  [t.rkAvail,fmt(dailyDDLimit),C.red],
                  [t.rkTarget,fmt(dailyAvg),C.green],
                  [t.rkUse,`${((dailyAvg/dailyDDLimit)*100).toFixed(0)}%`,C.gold],
                  [t.rkMargin,fmt(dailyDDLimit-dailyAvg),C.green],
                  [t.rkToDD,t.consecutiveL(Math.ceil(dailyDDLimit/avgLoss)),C.orange],
                  [t.rkToTot,t.consecutiveL(Math.ceil(totalDDLimit/avgLoss)),C.red],
                  [t.rkTrades,t.consecutiveL(Math.ceil(dailyDDLimit/160)),C.orange],
                ].map(([l,v,c])=><Row key={l} label={l} value={v} color={c}/>)}
                <div style={{marginTop:14,padding:12,background:C.green+"08",border:`1px solid ${C.green}20`,borderRadius:8,fontSize:12,color:C.muted,lineHeight:1.8}}>
                  {t.rkNote(Math.ceil(dailyDDLimit/160),avgLoss)}
                </div>
              </div>
            </div>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:20}}>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:"1px",textTransform:"uppercase",marginBottom:14}}>{t.rkPort}, {accsRec} {lang==="es"?"cuentas":"accounts"}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(145px,1fr))",gap:10,marginBottom:14}}>
                {[
                  {l:t.rkInvTot,v:fmt(evalFee*accsRec),c:C.red},
                  {l:t.rkIncF,v:simRes?fmt(simRes.medianIncome*accsRec):"–",c:C.gold},
                  {l:t.rkIncAnn,v:fmt(stableLive*12),c:C.green},
                  {l:t.rkROI,v:`${roiAnnual.toFixed(0)}%`,c:C.green},
                  {l:t.rkBreak,v:`${breakEvenMonths.toFixed(1)}m`,c:C.blue},
                  {l:t.rkRatioPort,v:simRes?`${(simRes.medianIncome/evalFee).toFixed(0)}×`:"–",c:C.green},
                ].map(({l,v,c})=><KPICard key={l} label={l} value={v} color={c} accent={c+"30"}/>)}
              </div>
              <div style={{background:C.gold+"08",border:`1px solid ${C.gold}25`,borderRadius:8,padding:"12px 16px",fontSize:13,color:C.muted,lineHeight:1.8}}>
                {t.rkPortNote(evalFee*accsRec,breakEvenMonths,simRes?simRes.blownPct:5)}
              </div>
            </div>
          </div>
        )}

        {/* ══ NETO ══ */}
        {tab==="neto"&&(
          <div className="gneto">
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:20,alignSelf:"start"}}>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:"1px",textTransform:"uppercase",marginBottom:16}}>{t.nTitle}</div>
              <Slider label={t.nFee} min={25} max={800} step={25} value={evalFee} onChange={setEvalFee} color={C.red}/>
              <Slider label={t.nPlat} min={0} max={500} step={25} value={platformCost} onChange={setPlatformCost} color={C.orange}/>
              <Slider label={t.nOther} min={0} max={500} step={25} value={otherCost} onChange={setOtherCost} color={C.orange}/>
              <Slider label={t.nTax} min={0} max={50} step={1} value={taxRate} onChange={setTaxRate} color={C.red} fmtFn={t.fmtPct}/>
              <Slider label={t.nHours} min={0.5} max={8} step={0.5} value={hoursPerDay} onChange={setHoursPerDay} color={C.blue} fmtFn={t.fmtH}/>
              <div style={{marginTop:14,padding:12,background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,fontSize:11,color:C.muted,lineHeight:1.8}}>{t.nNote}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:20}}>
                <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:"1px",textTransform:"uppercase",marginBottom:16}}>{t.nBreak} ({accsRec} {lang==="es"?"cuentas":"accounts"})</div>
                {[
                  {l:t.nGross,v:stableLive,c:C.green,bar:1.0},
                  {l:t.nFeeRow(monthlyEvalAmort),v:-monthlyEvalAmort,c:C.red,bar:monthlyEvalAmort/stableLive},
                  {l:t.nPlatRow(platformCost),v:-platformCost,c:C.red,bar:platformCost/stableLive},
                  {l:t.nOthRow(otherCost),v:-otherCost,c:C.red,bar:otherCost/stableLive},
                  {l:t.nTaxBase,v:monthlyTaxable,c:C.gold,bar:monthlyTaxable/stableLive,div:true},
                  {l:t.nTaxRow(taxRate),v:-monthlyTax,c:C.red,bar:monthlyTax/stableLive},
                  {l:t.nNetRow,v:monthlyNet,c:C.teal,bar:monthlyNet/stableLive,big:true},
                ].map(({l,v,c,bar,div,big})=>(
                  <div key={l}>
                    {div&&<div style={{borderTop:`1px dashed ${C.border2}`,margin:"8px 0"}}/>}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:`${big?"12px":"7px"} 0`,borderBottom:big?`1px solid ${C.border}`:"none"}}>
                      <span style={{fontSize:big?13:11,color:big?"#fff":C.muted,fontWeight:big?700:400,lineHeight:1.4,maxWidth:"50%"}}>{l}</span>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:Math.round(clamp(bar,0,1)*100),height:4,background:c+"70",borderRadius:2,minWidth:2,maxWidth:120}}/>
                        <span style={{fontSize:big?18:13,fontWeight:big?800:700,fontFamily:"monospace",color:c,minWidth:80,textAlign:"right"}}>{v>=0?"+":""}{fmt(Math.abs(v))}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10}}>
                {[
                  {l:t.kNetM,v:fmtK(monthlyNet),c:C.teal,s:""},
                  {l:t.kNetA,v:fmtK(monthlyNet*12),c:C.teal,s:""},
                  {l:t.kHourly,v:fmt(effectiveHourly),c:C.green,s:`${hoursPerDay}h × ${tradingDays}d`},
                  {l:t.kROI,v:`${roiAnnual.toFixed(0)}%`,c:C.green,s:""},
                  {l:t.kEffRate,v:`${((1-monthlyNet/stableLive)*100).toFixed(0)}%`,c:C.muted,s:""},
                  {l:t.kBE,v:`${breakEvenMonths.toFixed(1)}m`,c:C.gold,s:""},
                ].map(({l,v,c,s})=><KPICard key={l} label={l} value={v} sub={s} color={c} accent={c+"30"}/>)}
              </div>
            </div>
          </div>
        )}

        {/* ══ PIPELINE ══ */}
        {tab==="pipeline"&&(
          <div>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"13px 18px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
              <div style={{display:"flex",gap:14,flexWrap:"wrap",alignItems:"center"}}>
                {["eval","funded","live"].map(phase=>{
                  const n=accounts.filter(a=>a.phase===phase).length;
                  const c={eval:C.blue,funded:C.gold,live:C.green}[phase];
                  const label={eval:t.pInEval,funded:t.pInFund,live:t.pInLive}[phase];
                  return <div key={phase} style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:c,boxShadow:`0 0 5px ${c}`}}/>
                    <span style={{fontSize:13,color:C.muted}}><span style={{color:c,fontWeight:700}}>{n}</span> {label}</span>
                  </div>;
                })}
                <div style={{borderLeft:`1px solid ${C.border}`,paddingLeft:14}}>
                  <span style={{fontSize:10,color:C.muted,fontWeight:600,letterSpacing:"0.7px"}}>{t.pIncLabel} </span>
                  <span style={{fontSize:18,fontWeight:800,fontFamily:"monospace",color:pipelineIncome>=monthGoal?C.green:C.gold}}>{fmtK(pipelineIncome)}</span>
                  <span style={{fontSize:11,color:C.muted,marginLeft:6}}>{pipelineIncome>=monthGoal?"✓":""} {((pipelineIncome/monthGoal)*100).toFixed(0)}% {t.ofGoal}</span>
                </div>
              </div>
              <button onClick={()=>setEditingAcc(newAcc())} style={{background:C.green,border:"none",color:"#05050d",padding:"9px 16px",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,borderRadius:6}}>{t.pAdd}</button>
            </div>
            {accounts.length===0?(
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:40,textAlign:"center",color:C.muted,fontSize:14}}>{t.pEmpty}</div>
            ):(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:12,marginBottom:14}}>
                {accounts.map(acc=>(
                  <AccountCard key={acc.id} acc={acc} liveBuffer={liveBuffer} tradingDays={tradingDays}
                    onEdit={setEditingAcc} onDelete={id=>setAccounts(p=>p.filter(a=>a.id!==id))} t={t}/>
                ))}
              </div>
            )}
            {accounts.length>0&&(
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:18}}>
                <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:"1px",textTransform:"uppercase",marginBottom:14}}>{t.pSummary}</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
                  {[
                    {l:t.pTotal,v:accounts.length,c:C.text},
                    {l:t.pInEval,v:accounts.filter(a=>a.phase==="eval").length,c:C.blue},
                    {l:t.pInFund,v:accounts.filter(a=>a.phase==="funded").length,c:C.gold},
                    {l:t.pInLive,v:accounts.filter(a=>a.phase==="live").length,c:C.green},
                    {l:t.pTotalInc,v:fmtK(pipelineIncome),c:C.green},
                    {l:t.pVsGoal,v:`${((pipelineIncome/monthGoal)*100).toFixed(0)}%`,c:pipelineIncome>=monthGoal?C.green:C.gold},
                  ].map(({l,v,c})=>(
                    <div key={l} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:7,padding:"12px 14px"}}>
                      <div style={{fontSize:10,color:C.muted,fontWeight:600,letterSpacing:"0.7px",marginBottom:4,textTransform:"uppercase"}}>{l}</div>
                      <div style={{fontSize:22,fontWeight:800,fontFamily:"monospace",color:c}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        </motion.div>
        </AnimatePresence>
      </div>
      {/* Brand footer, ties the tool back to the TradeDadLog ecosystem */}
      <div style={{maxWidth:1100,margin:"30px auto 0",padding:"18px 16px 4px",borderTop:`1px solid ${C.border}`,display:"flex",flexWrap:"wrap",gap:"6px 16px",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
        <span style={{fontSize:12.5,color:C.muted}}>Part of <a href="https://tradedadlog.com/" style={{color:C.gold,fontWeight:700,textDecoration:"none"}}>TradeDadLog</a>, free tools for disciplined traders</span>
        <span style={{color:C.dim}}>·</span>
        <a href="https://mywhyjournal.com/" style={{fontSize:12.5,color:C.muted,textDecoration:"none"}}>Trading Journal</a>
        <span style={{color:C.dim}}>·</span>
        <a href="https://x.com/TradeDadLog" target="_blank" rel="noopener" style={{fontSize:12.5,color:C.muted,textDecoration:"none"}}>@TradeDadLog</a>
      </div>
    </div>
    </MotionConfig>
  );
}
