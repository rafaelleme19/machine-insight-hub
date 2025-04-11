
import React from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MachineStatus } from "@/types";

interface HistoryEntry {
  timestamp: Date;
  status: MachineStatus;
  duration: number;
}

interface StatusHistoryChartProps {
  history: HistoryEntry[];
}

const StatusHistoryChart = ({ history }: StatusHistoryChartProps) => {
  // Converte os dados históricos para o formato esperado pelo gráfico
  const processedData = history.map((entry) => {
    return {
      hora: entry.timestamp.getHours() + ":" + String(entry.timestamp.getMinutes()).padStart(2, '0'),
      status: entry.status,
      duracao: Math.round(entry.duration / 60) // Converte para minutos
    };
  });

  // Mapeia status numérico para string legível
  const getStatusName = (status: MachineStatus) => {
    switch (status) {
      case 1: return "Operação";
      case 2: return "Qualidade";
      case 3: return "Logística";
      case 4: return "Manutenção";
      default: return "Desconhecido";
    }
  };

  // Mapeia status para cor
  const getStatusColor = (status: MachineStatus) => {
    switch (status) {
      case 1: return "#22c55e";
      case 2: return "#facc15";
      case 3: return "#f97316";
      case 4: return "#ef4444";
      default: return "#64748b";
    }
  };

  // Personaliza o tooltip para mostrar status como texto
  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border p-2 rounded shadow-sm">
          <p className="font-medium">{`Hora: ${label}`}</p>
          <p className="text-sm">{`Status: ${getStatusName(data.status)}`}</p>
          <p className="text-sm">{`Duração: ${data.duracao} minutos`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Histórico de Estados</CardTitle>
        <CardDescription>
          Eventos de mudança de estado nas últimas 24h
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hora" />
            <YAxis 
              label={{ value: 'Duração (min)', angle: -90, position: 'insideLeft' }} 
              domain={[0, 'dataMax + 10']}
            />
            <Tooltip content={customTooltip} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="duracao" 
              name="Duração" 
              stroke="#3b82f6" 
              activeDot={{ r: 8 }}
              strokeWidth={2}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                return (
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={6} 
                    fill={getStatusColor(payload.status)} 
                    stroke="#fff" 
                    strokeWidth={2}
                  />
                );
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default StatusHistoryChart;
