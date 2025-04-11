
import { Machine, MachineDetails, MachineStatus, StatusNameMap } from "@/types";

// Range de IPs: 172.16.8.110 até 172.16.8.130
const IP_START = 110;
const IP_END = 130;

// Gera um array de IPs para as máquinas
const generateMachineIPs = () => {
  const ips: string[] = [];
  for (let i = IP_START; i <= IP_END; i++) {
    ips.push(`172.16.8.${i}`);
  }
  return ips;
};

// Simula a leitura inicial de dados das máquinas (em uma API real, isso seria uma conexão Modbus)
export const fetchMachinesData = (): Promise<Machine[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const ips = generateMachineIPs();
      const machines: Machine[] = ips.map((ip, index) => {
        const status = (Math.floor(Math.random() * 4) + 1) as MachineStatus;
        return {
          id: index + 1,
          ip,
          name: `Máquina ${index + 1}`,
          status,
          statusName: StatusNameMap[status],
          currentStatusDuration: Math.floor(Math.random() * 3600), // Até 1 hora em segundos
          statusTimes: {
            operational: Math.floor(Math.random() * 7200), // Até 2 horas em segundos
            qualityStop: Math.floor(Math.random() * 1800), // Até 30 minutos
            logisticStop: Math.floor(Math.random() * 1800),
            maintenanceStop: Math.floor(Math.random() * 3600)
          },
          lastUpdated: new Date()
        };
      });
      resolve(machines);
    }, 500); // Simula um delay de rede
  });
};

// Simula atualizações contínuas (polling)
export const pollMachineUpdates = (
  currentMachines: Machine[],
  callback: (updatedMachines: Machine[]) => void
) => {
  const intervalId = setInterval(() => {
    const updatedMachines = currentMachines.map(machine => {
      // 10% de chance de mudar o status a cada poll
      const shouldChangeStatus = Math.random() < 0.1;
      let newStatus = machine.status;
      
      if (shouldChangeStatus) {
        // Gera um novo status diferente do atual
        const possibleStatuses = [1, 2, 3, 4].filter(s => s !== machine.status) as MachineStatus[];
        newStatus = possibleStatuses[Math.floor(Math.random() * possibleStatuses.length)];
      }

      // Incrementa os contadores de tempo
      const updatedStatusTimes = { ...machine.statusTimes };
      updatedStatusTimes[
        newStatus === 1 ? 'operational' : 
        newStatus === 2 ? 'qualityStop' : 
        newStatus === 3 ? 'logisticStop' : 
        'maintenanceStop'
      ] += 5; // Incremento de 5 segundos

      // Se manteve o mesmo status, incrementa a duração atual
      const currentStatusDuration = 
        newStatus === machine.status 
          ? machine.currentStatusDuration + 5 
          : 0; // Reset se mudou o status

      return {
        ...machine,
        status: newStatus,
        statusName: StatusNameMap[newStatus],
        currentStatusDuration,
        statusTimes: updatedStatusTimes,
        lastUpdated: new Date()
      };
    });

    callback(updatedMachines);
  }, 5000); // Atualiza a cada 5 segundos

  // Retorna o ID do intervalo para que possa ser limpo quando necessário
  return intervalId;
};

// Simula a obtenção de detalhes de uma máquina específica
export const fetchMachineDetails = (machineId: number): Promise<MachineDetails> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Gera dados detalhados para a máquina
      const history = Array.from({ length: 24 }, (_, i) => {
        const status = (Math.floor(Math.random() * 4) + 1) as MachineStatus;
        return {
          timestamp: new Date(new Date().setHours(new Date().getHours() - 24 + i)),
          status,
          duration: Math.floor(Math.random() * 3600) // Até 1 hora em segundos
        };
      });

      // Calcula métricas de OEE (simulação)
      const availability = Math.random() * (0.99 - 0.7) + 0.7; // 70% a 99%
      const performance = Math.random() * (0.99 - 0.8) + 0.8; // 80% a 99%
      const quality = Math.random() * (0.99 - 0.9) + 0.9; // 90% a 99%
      const oee = availability * performance * quality;

      resolve({
        id: machineId,
        ip: `172.16.8.${IP_START + machineId - 1}`,
        name: `Máquina ${machineId}`,
        status: (Math.floor(Math.random() * 4) + 1) as MachineStatus,
        statusName: StatusNameMap[(Math.floor(Math.random() * 4) + 1) as MachineStatus],
        currentStatusDuration: Math.floor(Math.random() * 3600),
        statusTimes: {
          operational: Math.floor(Math.random() * 28800), // Até 8 horas
          qualityStop: Math.floor(Math.random() * 3600),
          logisticStop: Math.floor(Math.random() * 3600),
          maintenanceStop: Math.floor(Math.random() * 3600)
        },
        lastUpdated: new Date(),
        oee,
        availability,
        performance,
        quality,
        history
      });
    }, 500);
  });
};
