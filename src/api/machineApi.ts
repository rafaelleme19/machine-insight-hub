
import { Machine, MachineDetails, MachineStatus, StatusNameMap } from "@/types";

// Range de IPs: 172.16.8.110 até 172.16.8.130
const IP_START = 110;
const IP_END = 130;
const MODBUS_PORT = 502;
const STATUS_REGISTER = 100; // Registro onde está o status da máquina (exemplo)

// Gera um array de IPs para as máquinas
const generateMachineIPs = () => {
  const ips: string[] = [];
  for (let i = IP_START; i <= IP_END; i++) {
    ips.push(`172.16.8.${i}`);
  }
  return ips;
};

// Classe simuladora de cliente Modbus para ambiente de navegador
class BrowserModbusClient {
  private static instance: BrowserModbusClient;
  private connectionStatus: Map<string, boolean> = new Map();
  private machineStatuses: Map<string, MachineStatus> = new Map();

  private constructor() {
    // Inicializa com estados aleatórios para simulação
    const ips = generateMachineIPs();
    ips.forEach(ip => {
      this.machineStatuses.set(ip, Math.floor(Math.random() * 4 + 1) as MachineStatus);
      this.connectionStatus.set(ip, Math.random() > 0.2); // 80% de chance de estar conectado
    });
  }

  public static getInstance(): BrowserModbusClient {
    if (!BrowserModbusClient.instance) {
      BrowserModbusClient.instance = new BrowserModbusClient();
    }
    return BrowserModbusClient.instance;
  }

  async connect(ip: string): Promise<boolean> {
    // Simula uma tentativa de conexão com 80% de chance de sucesso
    const isConnected = Math.random() > 0.2;
    this.connectionStatus.set(ip, isConnected);
    
    console.log(`${isConnected ? 'Conectado' : 'Falha ao conectar'} com a máquina ${ip}`);
    
    return isConnected;
  }

  async readStatus(ip: string): Promise<MachineStatus> {
    // Verifica se temos uma conexão simulada
    const isConnected = this.connectionStatus.get(ip) || false;
    
    if (!isConnected) {
      // Se não estiver conectado, gera um status aleatório
      return (Math.floor(Math.random() * 4) + 1) as MachineStatus;
    }
    
    // Se estiver "conectado", há uma chance de o status mudar
    if (Math.random() < 0.3) { // 30% de chance de mudar o status
      const newStatus = (Math.floor(Math.random() * 4) + 1) as MachineStatus;
      this.machineStatuses.set(ip, newStatus);
    }
    
    return this.machineStatuses.get(ip) || 1;
  }

  disconnect(ip: string): void {
    if (this.connectionStatus.has(ip)) {
      this.connectionStatus.set(ip, false);
      console.log(`Desconectado da máquina ${ip}`);
    }
  }

  disconnectAll(): void {
    const ips = Array.from(this.connectionStatus.keys());
    for (const ip of ips) {
      this.disconnect(ip);
    }
  }
}

// Simula a leitura inicial de dados das máquinas (compatível com navegador)
export const fetchMachinesData = async (): Promise<Machine[]> {
  const modbusClient = BrowserModbusClient.getInstance();
  const ips = generateMachineIPs();
  const machines: Machine[] = [];

  for (let i = 0; i < ips.length; i++) {
    const ip = ips[i];
    try {
      await modbusClient.connect(ip);
      const status = await modbusClient.readStatus(ip);
      
      machines.push({
        id: i + 1,
        ip,
        name: `Máquina ${i + 1}`,
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
      });
    } catch (error) {
      console.error(`Erro ao obter dados da máquina ${ip}:`, error);
    }
  }

  return machines;
};

// Atualiza dados das máquinas em tempo real via polling
export const pollMachineUpdates = (
  currentMachines: Machine[],
  callback: (updatedMachines: Machine[]) => void
): number => {
  const modbusClient = BrowserModbusClient.getInstance();
  
  const intervalId = setInterval(async () => {
    const updatedMachines = [...currentMachines];
    
    for (const machine of updatedMachines) {
      try {
        // Lê o novo status via Modbus
        const newStatus = await modbusClient.readStatus(machine.ip);
        
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

        Object.assign(machine, {
          status: newStatus,
          statusName: StatusNameMap[newStatus],
          currentStatusDuration,
          statusTimes: updatedStatusTimes,
          lastUpdated: new Date()
        });
      } catch (error) {
        console.error(`Erro ao atualizar máquina ${machine.ip}:`, error);
      }
    }

    callback(updatedMachines);
  }, 5000); // Atualiza a cada 5 segundos

  // Retorna o ID do intervalo para que possa ser limpo quando necessário
  return intervalId;
};

// Simula a obtenção de detalhes de uma máquina específica
export const fetchMachineDetails = async (machineId: number): Promise<MachineDetails> => {
  const modbusClient = BrowserModbusClient.getInstance();
  const ip = `172.16.8.${IP_START + machineId - 1}`;
  
  try {
    await modbusClient.connect(ip);
    // Lê o status atual via Modbus
    const status = await modbusClient.readStatus(ip);
    
    // Gera dados detalhados para a máquina (alguns ainda simulados para OEE, etc)
    const history = Array.from({ length: 24 }, (_, i) => {
      const historyStatus = (Math.floor(Math.random() * 4) + 1) as MachineStatus;
      return {
        timestamp: new Date(new Date().setHours(new Date().getHours() - 24 + i)),
        status: historyStatus,
        duration: Math.floor(Math.random() * 3600) // Até 1 hora em segundos
      };
    });

    // Calcula métricas de OEE (simulação)
    const availability = Math.random() * (0.99 - 0.7) + 0.7; // 70% a 99%
    const performance = Math.random() * (0.99 - 0.8) + 0.8; // 80% a 99%
    const quality = Math.random() * (0.99 - 0.9) + 0.9; // 90% a 99%
    const oee = availability * performance * quality;

    return {
      id: machineId,
      ip,
      name: `Máquina ${machineId}`,
      status,
      statusName: StatusNameMap[status],
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
    };
  } catch (error) {
    console.error(`Erro ao obter detalhes da máquina ${ip}:`, error);
    // Retorna dados simulados em caso de erro
    return {
      id: machineId,
      ip,
      name: `Máquina ${machineId}`,
      status: (Math.floor(Math.random() * 4) + 1) as MachineStatus,
      statusName: StatusNameMap[(Math.floor(Math.random() * 4) + 1) as MachineStatus],
      currentStatusDuration: Math.floor(Math.random() * 3600),
      statusTimes: {
        operational: Math.floor(Math.random() * 28800),
        qualityStop: Math.floor(Math.random() * 3600),
        logisticStop: Math.floor(Math.random() * 3600),
        maintenanceStop: Math.floor(Math.random() * 3600)
      },
      lastUpdated: new Date(),
      oee: Math.random() * (0.99 - 0.5) + 0.5,
      availability: Math.random() * (0.99 - 0.7) + 0.7,
      performance: Math.random() * (0.99 - 0.8) + 0.8,
      quality: Math.random() * (0.99 - 0.9) + 0.9,
      history: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(new Date().setHours(new Date().getHours() - 24 + i)),
        status: (Math.floor(Math.random() * 4) + 1) as MachineStatus,
        duration: Math.floor(Math.random() * 3600)
      }))
    };
  }
};

// Função para limpar todas as conexões ao desmontar a aplicação
export const cleanupModbusConnections = (): void => {
  const modbusClient = BrowserModbusClient.getInstance();
  modbusClient.disconnectAll();
};
