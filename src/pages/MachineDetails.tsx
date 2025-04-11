
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchMachineDetails } from "@/api/machineApi";
import { MachineDetails as MachineDetailsType } from "@/types";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import StatusBadge from "@/components/StatusBadge";
import OEEChart from "@/components/OEEChart";
import StatusTimesChart from "@/components/StatusTimesChart";
import StatusHistoryChart from "@/components/StatusHistoryChart";
import { formatTimeFromSeconds, formatPercent, formatDateTime } from "@/utils/formatters";
import { 
  ArrowLeft, 
  HardDrive, 
  Gauge, 
  Clock, 
  RefreshCw 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const MachineDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [machine, setMachine] = useState<MachineDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      if (!id) {
        throw new Error("ID da máquina não especificado");
      }
      const data = await fetchMachineDetails(parseInt(id, 10));
      setMachine(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching machine details:", err);
      setError("Falha ao carregar detalhes da máquina");
      toast({
        title: "Erro",
        description: "Não foi possível obter os detalhes da máquina",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Configura polling para atualizar os dados a cada 10 segundos
    const intervalId = setInterval(fetchData, 10000);
    
    // Limpa o intervalo quando o componente é desmontado
    return () => clearInterval(intervalId);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-6 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </main>
      </div>
    );
  }

  if (error || !machine) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="p-6 text-center">
            <p className="text-destructive">{error || "Máquina não encontrada"}</p>
            <div className="mt-4 flex justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={fetchData}
              >
                Tentar novamente
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/">Voltar ao Dashboard</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link 
            to="/" 
            className="text-sm text-muted-foreground hover:text-foreground flex items-center mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar ao Dashboard
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-2 md:mb-0">
              <HardDrive className="h-6 w-6 mr-2 text-primary" />
              <h1 className="text-2xl font-bold mr-3">{machine.name}</h1>
              <StatusBadge status={machine.status} size="lg" />
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                IP: {machine.ip}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={fetchData}
              >
                <RefreshCw className="h-4 w-4" />
                <span>Atualizar</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Gauge className="h-5 w-5 mr-2 text-primary" />
                OEE
              </CardTitle>
              <CardDescription>Overall Equipment Effectiveness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatPercent(machine.oee)}
              </div>
              <div className="grid grid-cols-3 gap-1 mt-2 text-xs">
                <div>
                  <span className="text-muted-foreground block">Disp:</span>
                  <span>{formatPercent(machine.availability)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Perf:</span>
                  <span>{formatPercent(machine.performance)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Qual:</span>
                  <span>{formatPercent(machine.quality)}</span>
                </div>
              </div>
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
                {formatTimeFromSeconds(machine.statusTimes.operational)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Equivalente a {(machine.statusTimes.operational / 3600).toFixed(1)} horas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2 text-qualityStop" />
                Tempo de Paradas
              </CardTitle>
              <CardDescription>Total de todas as paradas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatTimeFromSeconds(
                  machine.statusTimes.qualityStop + 
                  machine.statusTimes.logisticStop + 
                  machine.statusTimes.maintenanceStop
                )}
              </div>
              <div className="grid grid-cols-3 gap-1 mt-2 text-xs">
                <div>
                  <span className="text-muted-foreground block">Qual:</span>
                  <span>{formatTimeFromSeconds(machine.statusTimes.qualityStop)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Log:</span>
                  <span>{formatTimeFromSeconds(machine.statusTimes.logisticStop)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Manut:</span>
                  <span>{formatTimeFromSeconds(machine.statusTimes.maintenanceStop)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                Status Atual
              </CardTitle>
              <CardDescription>Tempo no estado atual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center gap-2">
                {formatTimeFromSeconds(machine.currentStatusDuration)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Última atualização: {formatDateTime(machine.lastUpdated)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <OEEChart 
            availability={machine.availability}
            performance={machine.performance}
            quality={machine.quality}
            oee={machine.oee}
          />
          
          <StatusTimesChart statusTimes={machine.statusTimes} />
        </div>

        <div className="mb-6">
          <StatusHistoryChart history={machine.history} />
        </div>
      </main>
    </div>
  );
};

export default MachineDetails;
