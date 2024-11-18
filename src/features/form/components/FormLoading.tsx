import React from 'react';
import { Spinner } from '@nextui-org/react';

export const FormLoading: React.FC = () => (
  <div className='flex items-center justify-center min-h-screen'>
    <Spinner label='加载中...' />
  </div>
);