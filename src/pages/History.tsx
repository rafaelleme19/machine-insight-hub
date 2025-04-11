
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { useMachines } from "@/contexts/MachineContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import StatusBadge from "@/components/StatusBadge";
import { formatTimeFromSeconds, formatDateTime } from "@/utils/formatters";
import LoadingSpinner from "@/components/LoadingSpinner";

const History = () => {
  const { machines, loading } = useMachines();
  const [selectedMachine, setSelectedMachine] = useState<string>("all");

  // Filtra máquinas baseado na seleção
  const filteredMachines = selectedMachine === "all" 
    ? machines 
    : machines.filter(m => m.id.toString() === selectedMachine);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold mb-2 md:mb-0">Histórico de Máquinas</h1>
          
          <div className="w-full md:w-64">
            <Select 
              value={selectedMachine} 
              onValueChange={setSelectedMachine}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar máquina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as máquinas</SelectItem>
                {machines.map(machine => (
                  <SelectItem key={machine.id} value={machine.id.toString()}>
                    {machine.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resumo de Status</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Máquina</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tempo Operação</TableHead>
                    <TableHead>Tempo Qualidade</TableHead>
                    <TableHead>Tempo Logística</TableHead>
                    <TableHead>Tempo Manutenção</TableHead>
                    <TableHead>Última Atualização</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMachines.map(machine => (
                    <TableRow key={machine.id}>
                      <TableCell className="font-medium">{machine.name}</TableCell>
                      <TableCell>{machine.ip}</TableCell>
                      <TableCell>
                        <StatusBadge status={machine.status} />
                      </TableCell>
                      <TableCell>{formatTimeFromSeconds(machine.statusTimes.operational)}</TableCell>
                      <TableCell>{formatTimeFromSeconds(machine.statusTimes.qualityStop)}</TableCell>
                      <TableCell>{formatTimeFromSeconds(machine.statusTimes.logisticStop)}</TableCell>
                      <TableCell>{formatTimeFromSeconds(machine.statusTimes.maintenanceStop)}</TableCell>
                      <TableCell>{formatDateTime(machine.lastUpdated)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default History;
