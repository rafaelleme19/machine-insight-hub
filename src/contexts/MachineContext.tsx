
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { fetchMachinesData, pollMachineUpdates, cleanupModbusConnections } from "@/api/machineApi";
import { Machine } from "@/types";
import { useToast } from "@/components/ui/use-toast";

interface MachineContextType {
  machines: Machine[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const MachineContext = createContext<MachineContextType | undefined>(undefined);

export const MachineProvider = ({ children }: { children: ReactNode }) => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await fetchMachinesData();
      setMachines(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching machine data:", err);
      setError("Falha ao carregar dados das máquinas");
      toast({
        title: "Erro",
        description: "Não foi possível obter os dados das máquinas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Limpa as conexões Modbus quando o componente é desmontado
    return () => {
      cleanupModbusConnections();
    };
  }, []);

  useEffect(() => {
    if (machines.length === 0) return;

    // Inicia o polling para atualizações contínuas
    const intervalId = pollMachineUpdates(machines, (updatedMachines) => {
      setMachines(updatedMachines);
    });

    // Limpa o intervalo quando o componente é desmontado
    return () => clearInterval(intervalId);
  }, [machines.length]);

  const refreshData = async () => {
    await fetchData();
  };

  return (
    <MachineContext.Provider value={{ machines, loading, error, refreshData }}>
      {children}
    </MachineContext.Provider>
  );
};

export const useMachines = () => {
  const context = useContext(MachineContext);
  if (context === undefined) {
    throw new Error("useMachines deve ser usado dentro de um MachineProvider");
  }
  return context;
};
