'use client';

import * as React from 'react';

export type ToastActionElement = React.ReactNode;

export interface ToastProps {
  id?: string;
  open?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  onOpenChange?: (open: boolean) => void;
}

export function Toast(_props: ToastProps) {
  return null;
}

export default Toast;
