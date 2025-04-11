
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface OEEChartProps {
  availability: number;
  performance: number;
  quality: number;
  oee: number;
}

const OEEChart = ({ availability, performance, quality, oee }: OEEChartProps) => {
  const data = [
    { name: "Disponibilidade", value: availability, color: "#3b82f6" },
    { name: "Performance", value: performance, color: "#22c55e" },
    { name: "Qualidade", value: quality, color: "#eab308" }
  ];

  const formatTooltip = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Indicador OEE</CardTitle>
        <CardDescription>
          OEE: {(oee * 100).toFixed(1)}%
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              label={({ value }) => `${(value * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={formatTooltip} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default OEEChart;
