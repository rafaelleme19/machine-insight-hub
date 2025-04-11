
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusTimes } from "@/types";

interface StatusTimesChartProps {
  statusTimes: StatusTimes;
}

const StatusTimesChart = ({ statusTimes }: StatusTimesChartProps) => {
  // Converte os segundos para horas para melhor visualização
  const data = [
    { 
      name: "Operação", 
      horas: Number((statusTimes.operational / 3600).toFixed(2)), 
      cor: "#22c55e" 
    },
    { 
      name: "Qualidade", 
      horas: Number((statusTimes.qualityStop / 3600).toFixed(2)), 
      cor: "#facc15" 
    },
    { 
      name: "Logística", 
      horas: Number((statusTimes.logisticStop / 3600).toFixed(2)), 
      cor: "#f97316" 
    },
    { 
      name: "Manutenção", 
      horas: Number((statusTimes.maintenanceStop / 3600).toFixed(2)), 
      cor: "#ef4444" 
    }
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Tempos por Estado</CardTitle>
        <CardDescription>
          Distribuição de tempo por tipo de estado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'Horas', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value) => [`${value} horas`, "Tempo"]}
              labelFormatter={(label) => `Estado: ${label}`}
            />
            <Bar dataKey="horas" name="Horas" fill="#3b82f6">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.cor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default StatusTimesChart;
