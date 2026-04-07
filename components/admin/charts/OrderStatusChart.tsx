"use client";
import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Order } from "@/lib/types";

interface OrderStatusChartProps {
  orders: Order[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  yangi: { label: "Yangi", color: "#3b82f6" },
  tasdiqlangan: { label: "Tasdiqlangan", color: "#f59e0b" },
  "yigʻilmoqda": { label: "Yig'ilmoqda", color: "#8b5cf6" },
  yetkazilmoqda: { label: "Yetkazilmoqda", color: "#f97316" },
  yetkazildi: { label: "Yetkazildi", color: "#10b981" },
  bekor_qilindi: { label: "Bekor qilindi", color: "#ef4444" },
};

export default function OrderStatusChart({ orders }: OrderStatusChartProps) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of orders) {
      const status = o.status || "yangi";
      counts[status] = (counts[status] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([key, value]) => ({
        name: STATUS_CONFIG[key]?.label || key,
        value,
        color: STATUS_CONFIG[key]?.color || "#9ca3af",
      }))
      .sort((a, b) => b.value - a.value);
  }, [orders]);

  const total = orders.length;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400">
        Buyurtmalar mavjud emas
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="w-40 h-40 sm:w-48 sm:h-48 relative shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="85%"
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-lg text-xs">
                    <p className="font-bold">{d.name}: {d.value} ta</p>
                    <p className="text-gray-500">{((d.value / total) * 100).toFixed(0)}%</p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{total}</p>
          <p className="text-[10px] text-gray-500">jami</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap sm:flex-col gap-2 sm:gap-1.5 justify-center">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-gray-600">{item.name}</span>
            <span className="text-xs font-bold text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
