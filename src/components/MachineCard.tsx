import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Machine } from "@/types";
import StatusBadge from "./StatusBadge";
import { formatTimeFromSeconds, formatDateTime } from "@/utils/formatters";
import { HardDrive, Clock } from "lucide-react";
interface MachineCardProps {
  machine: Machine;
}
const MachineCard = ({
  machine
}: MachineCardProps) => {
  return <Link to={`/maquina/${machine.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center font-normal">
              <HardDrive className="h-5 w-5 mr-2 text-muted-foreground" />
              {machine.name}
            </CardTitle>
            <StatusBadge status={machine.status} />
          </div>
          <p className="text-xs text-muted-foreground">{machine.ip}</p>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Tempo atual:</span>
              <span className="font-medium flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatTimeFromSeconds(machine.currentStatusDuration)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex flex-col">
                <span className="text-muted-foreground">Operação:</span>
                <span className="font-medium">{formatTimeFromSeconds(machine.statusTimes.operational)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Qualidade:</span>
                <span className="font-medium">{formatTimeFromSeconds(machine.statusTimes.qualityStop)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Logística:</span>
                <span className="font-medium">{formatTimeFromSeconds(machine.statusTimes.logisticStop)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Manutenção:</span>
                <span className="font-medium">{formatTimeFromSeconds(machine.statusTimes.maintenanceStop)}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <p className="text-xs text-muted-foreground w-full text-right">
            Atualizado: {formatDateTime(machine.lastUpdated)}
          </p>
        </CardFooter>
      </Card>
    </Link>;
};
export default MachineCard;