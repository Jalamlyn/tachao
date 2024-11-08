import React from 'react';
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
import { useBreadcrumb } from '../contexts/BreadcrumbContext';

const GlobalBreadcrumb: React.FC = () => {
  const { breadcrumbs } = useBreadcrumb();

  return (
    <Breadcrumbs>
      {breadcrumbs.map((item, index) => (
        <BreadcrumbItem key={index} href={item.href}>
          {item.label}
        </BreadcrumbItem>
      ))}
    </Breadcrumbs>
  );
};

export default GlobalBreadcrumb;