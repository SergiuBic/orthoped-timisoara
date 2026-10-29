"use client";
import { useTranslations } from "next-intl";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const NAVY = "#1d3461";
const PEACH = "#e8916a";
const PALETTE = ["#1d3461", "#e8916a", "#ffbe98", "#6b7a99", "#a9b4cc"];
const GRID = "currentColor";
const tick = { fontSize: 12, fill: "currentColor", opacity: 0.7 };
const tipStyle = { borderRadius: 16, border: "1px solid rgba(15,30,61,.12)", background: "rgba(255,255,255,.95)", color: "#0f1e3d", fontSize: 13 };

export function DailyChart({ data }: { data: { day: string; visitors: number; conversions: number }[] }) {
  const t = useTranslations("Admin.overview");
  return (
    <div className="h-64 w-full text-fg" role="img" aria-label={t("charts.daily")}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke={GRID} strokeOpacity={0.1} vertical={false} />
          <XAxis dataKey="day" tick={tick} tickFormatter={(d: string) => d.slice(5)} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis tick={tick} allowDecimals={false} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tipStyle} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="visitors" name={t("tiles.visitors")} stroke={NAVY} strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="conversions" name={t("charts.conversions")} stroke={PEACH} strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PlacementChart({ data }: { data: { placement: string; clicks: number }[] }) {
  const t = useTranslations("Admin.overview");
  if (!data.length) return <Empty />;
  return (
    <div className="h-64 w-full text-fg" role="img" aria-label={t("charts.placements")}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke={GRID} strokeOpacity={0.1} vertical={false} />
          <XAxis dataKey="placement" tick={tick} tickLine={false} axisLine={false} />
          <YAxis tick={tick} allowDecimals={false} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tipStyle} cursor={{ fill: "rgba(255,190,152,.2)" }} />
          <Bar dataKey="clicks" name={t("charts.clicks")} fill={PEACH} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Donut({ data, label }: { data: { name: string; value: number }[]; label: string }) {
  if (!data.length) return <Empty />;
  return (
    <div className="h-56 w-full text-fg" role="img" aria-label={label}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2} stroke="none">
            {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
          </Pie>
          <Tooltip contentStyle={tipStyle} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function Empty() {
  const t = useTranslations("Admin.common");
  return <p className="grid h-40 place-items-center text-sm text-muted">{t("noData")}</p>;
}
