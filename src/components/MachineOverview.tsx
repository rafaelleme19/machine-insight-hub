
import React from "react";
import { Machine, MachineStatus } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMachines } from "@/contexts/MachineContext";
import { Gauge, Clock, AlertTriangle } from "lucide-react";
import { formatTimeFromSeconds } from "@/utils/formatters";

const MachineOverview = () => {
  const { machines, loading } = useMachines();

  const calculateTotals = (machines: Machine[]) => {
    // Inicializa contadores
    const statusCount = {
      1: 0, // Operação OK
      2: 0, // Parada Qualidade
      3: 0, // Parada Logística 
      4: 0  // Parada Manutenção
    };

    // Soma total de tempo por status
    const totalTimes = {
      operational: 0,
      qualityStop: 0,
      logisticStop: 0,
      maintenanceStop: 0
    };

    // Conta máquinas por status
    machines.forEach(machine => {
      statusCount[machine.status]++;
      
      // Acumula tempos
      totalTimes.operational += machine.statusTimes.operational;
      totalTimes.qualityStop += machine.statusTimes.qualityStop;
      totalTimes.logisticStop += machine.statusTimes.logisticStop;
      totalTimes.maintenanceStop += machine.statusTimes.maintenanceStop;
    });

    return { statusCount, totalTimes };
  };

  if (loading || machines.length === 0) {
    return null;
  }

  const { statusCount, totalTimes } = calculateTotals(machines);
  const totalMachines = machines.length;
  
  // Calcular disponibilidade geral (percentual de máquinas operacionais)
  const operationalPercentage = (statusCount[1] / totalMachines) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Gauge className="h-5 w-5 mr-2 text-primary" />
            Disponibilidade
          </CardTitle>
          <CardDescription>Máquinas em operação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {statusCount[1]}/{totalMachines}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {operationalPercentage.toFixed(1)}% em operação
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary" />
            Tempo Operacional
          </CardTitle>
          <CardDescription>Total acumulado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {formatTimeFromSeconds(totalTimes.operational)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Desde o início do turno
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-qualityStop" />
            Paradas Qualidade
          </CardTitle>
          <CardDescription>Máquinas e tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {statusCount[2]}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Tempo: {formatTimeFromSeconds(totalTimes.qualityStop)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-maintenanceStop" />
            Paradas Manutenção
          </CardTitle>
          <CardDescription>Máquinas e tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {statusCount[4]}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Tempo: {formatTimeFromSeconds(totalTimes.maintenanceStop)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MachineOverview;
