
import { Machine, MachineDetails, MachineStatus, StatusNameMap } from "@/types";
import ModbusRTU from "modbus-serial";

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

// Classe para gerenciar conexões Modbus
class ModbusClient {
  private static instance: ModbusClient;
  private clients: Map<string, ModbusRTU> = new Map();
  private connectionStatus: Map<string, boolean> = new Map();

  private constructor() {}

  public static getInstance(): ModbusClient {
    if (!ModbusClient.instance) {
      ModbusClient.instance = new ModbusClient();
    }
    return ModbusClient.instance;
  }

  async connect(ip: string): Promise<ModbusRTU> {
    if (this.clients.has(ip) && this.connectionStatus.get(ip)) {
      return this.clients.get(ip)!;
    }

    try {
      const client = new ModbusRTU();
      await client.connectTCP(ip, { port: MODBUS_PORT });
      client.setID(1);
      
      this.clients.set(ip, client);
      this.connectionStatus.set(ip, true);
      
      console.log(`Conectado com sucesso à máquina ${ip}`);
      return client;
    } catch (error) {
      console.error(`Erro ao conectar à máquina ${ip}:`, error);
      this.connectionStatus.set(ip, false);
      
      // Fallback para simular dados se não conseguirmos conectar (para desenvolvimento)
      const dummyClient = new ModbusRTU();
      this.clients.set(ip, dummyClient);
      return dummyClient;
    }
  }

  async readStatus(ip: string): Promise<MachineStatus> {
    try {
      const client = await this.connect(ip);
      if (!this.connectionStatus.get(ip)) {
        // Modo simulação se não tiver conexão
        return (Math.floor(Math.random() * 4) + 1) as MachineStatus;
      }
      
      // Lê o registro que contém o status da máquina
      const result = await client.readHoldingRegisters(STATUS_REGISTER, 1);
      const status = result.data[0];
      
      // Garante que o status está dentro dos valores permitidos (1-4)
      return (status >= 1 && status <= 4 ? status : 1) as MachineStatus;
    } catch (error) {
      console.error(`Erro ao ler o status da máquina ${ip}:`, error);
      // Retorna um status aleatório em caso de erro
      return (Math.floor(Math.random() * 4) + 1) as MachineStatus;
    }
  }

  async disconnect(ip: string): Promise<void> {
    if (this.clients.has(ip)) {
      try {
        const client = this.clients.get(ip)!;
        await client.close();
        this.connectionStatus.set(ip, false);
        console.log(`Desconectado da máquina ${ip}`);
      } catch (error) {
        console.error(`Erro ao desconectar da máquina ${ip}:`, error);
      }
    }
  }

  async disconnectAll(): Promise<void> {
    for (const ip of this.clients.keys()) {
      await this.disconnect(ip);
    }
  }
}

// Simula a leitura inicial de dados das máquinas via Modbus
export const fetchMachinesData = async (): Promise<Machine[]> => {
  const modbusClient = ModbusClient.getInstance();
  const ips = generateMachineIPs();
  const machines: Machine[] = [];

  for (let i = 0; i < ips.length; i++) {
    const ip = ips[i];
    try {
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
) => {
  const modbusClient = ModbusClient.getInstance();
  
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

// Simula a obtenção de detalhes de uma máquina específica (com alguns dados reais)
export const fetchMachineDetails = async (machineId: number): Promise<MachineDetails> => {
  const modbusClient = ModbusClient.getInstance();
  const ip = `172.16.8.${IP_START + machineId - 1}`;
  
  try {
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
export const cleanupModbusConnections = async (): void => {
  const modbusClient = ModbusClient.getInstance();
  await modbusClient.disconnectAll();
};
