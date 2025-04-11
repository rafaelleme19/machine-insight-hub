
export type MachineStatus = 1 | 2 | 3 | 4;

export interface StatusTimes {
  operational: number; // Tempo em segundos
  qualityStop: number;
  logisticStop: number;
  maintenanceStop: number;
}

export interface Machine {
  id: number;
  ip: string;
  name: string;
  status: MachineStatus;
  statusName: string;
  currentStatusDuration: number; // Quanto tempo está no status atual (segundos)
  statusTimes: StatusTimes; // Tempos acumulados por status
  lastUpdated: Date;
}

export interface MachineDetails extends Machine {
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  history: Array<{
    timestamp: Date;
    status: MachineStatus;
    duration: number; // Duração em segundos
  }>;
}

export const StatusNameMap: Record<MachineStatus, string> = {
  1: "Operação OK",
  2: "Parada Qualidade",
  3: "Parada Logística",
  4: "Parada Manutenção"
};

export const StatusColorMap: Record<MachineStatus, string> = {
  1: "status-operational",
  2: "status-quality",
  3: "status-logistic",
  4: "status-maintenance"
};
