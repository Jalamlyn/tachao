import React from "react";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { Icon } from "@iconify/react";

interface AppListProps {
  apps: string[];
}

const AppList: React.FC<AppListProps> = ({ apps }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {apps.map((app, index) => (
        <div key={index} className="w-full">
          <Card>
            <CardHeader className="flex-col items-center pb-0 pt-2">
              <Icon icon="mdi:application" width={48} height={48} />
            </CardHeader>
            <CardBody className="flex-center">
              <h4>{app}</h4>
            </CardBody>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default AppList;