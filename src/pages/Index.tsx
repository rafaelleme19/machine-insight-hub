
import React from "react";
import { useMachines } from "@/contexts/MachineContext";
import MachineCard from "@/components/MachineCard";
import MachineOverview from "@/components/MachineOverview";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { machines, loading, error, refreshData } = useMachines();

  const handleRefresh = async () => {
    await refreshData();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard de Máquinas</h1>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Atualizar</span>
          </Button>
        </div>

        <MachineOverview />

        {loading ? (
          <LoadingSpinner size="lg" />
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-destructive">{error}</p>
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              className="mt-4"
            >
              Tentar novamente
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {machines.map((machine) => (
              <MachineCard key={machine.id} machine={machine} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
