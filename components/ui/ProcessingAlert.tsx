"use client"
import { SpinnerIcon } from './Icons';

export function ProcessingAlert() {
  return (
    <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded flex items-center">
      <SpinnerIcon />
      Processing files...
    </div>
  );
}