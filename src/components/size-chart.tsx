"use client";
import { useState } from "react";
import { charts, chartSets, sizes } from "@/lib/size-charts";

const format = (inches: number, cm: boolean) =>
  cm ? (inches * 2.54).toFixed(1) : String(inches);

export function SizeChart({ set }: { set: string }) {
  const [cm, setCm] = useState(false);
  const selected = chartSets[set] || chartSets["women-suit"];
  return (
    <div className="size-chart">
      <div className="unit-toggle" role="group" aria-label="Measurement unit">
        <button
          type="button"
          aria-pressed={!cm}
          className={cm ? "" : "selected"}
          onClick={() => setCm(false)}
        >
          Inches
        </button>
        <button
          type="button"
          aria-pressed={cm}
          className={cm ? "selected" : ""}
          onClick={() => setCm(true)}
        >
          CM
        </button>
      </div>
      {selected.charts.map((id) => {
        const chart = charts[id];
        return (
          <section key={id}>
            <h3>
              {chart.title} <span>{chart.fit}</span>
            </h3>
            <div className="table-scroll">
              <table className="data-table size-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    {sizes.map((s) => (
                      <th key={s}>{s}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chart.rows.map(([label, values]) => (
                    <tr key={label}>
                      <th scope="row">{label}</th>
                      {values.map((v, i) => (
                        <td key={i}>{format(v, cm)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
      <p className="small-note">
        Garment measurements, taken flat. &ldquo;Across&rdquo; values are
        half-circumference; double them for the full measurement. Allow ±0.5 in
        for handwork.
      </p>
    </div>
  );
}
