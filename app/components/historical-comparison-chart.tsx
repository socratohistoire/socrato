import type { HistoricalComparisonChart as HistoricalComparisonChartData } from "@/lib/pedagogical-reference/historical-comparison-charts";
import styles from "./historical-comparison-chart.module.css";

export function HistoricalComparisonChart({ chart }: { chart: HistoricalComparisonChartData }) {
  const maximum = Math.max(...chart.items.map(({ value }) => value));

  return <figure className={styles.chart} aria-label={chart.accessibleDescription}>
    <figcaption><small>{chart.typeLabel} · {chart.dateLabel}</small><h3>{chart.title}</h3></figcaption>
    {chart.layout === "vertical" ? <div className={styles.verticalPlot}>{chart.items.map((item) => <div className={styles.verticalColumn} key={item.id}>
      <span className={styles.verticalValue}>{item.displayValue}</span>
      <div className={styles.verticalTrack}><span className={styles.verticalBar} style={{ height: `${(item.value / maximum) * 100}%` }} /></div>
      <strong className={styles.verticalLabel}>{item.label}</strong>
    </div>)}</div> : <div className={styles.plot}>{chart.items.map((item) => <div className={styles.row} key={item.id}>
      <div className={styles.label}><strong>{item.label}</strong><span>{item.displayValue}</span></div>
      <div className={styles.track}><span className={styles.bar} style={{ width: `${(item.value / maximum) * 100}%` }} /></div>
    </div>)}</div>}
    <p className={styles.unit}>Unité : {chart.unitLabel}</p>
  </figure>;
}
