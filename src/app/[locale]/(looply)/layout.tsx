import { ReactNode } from 'react';

export default function LooplyLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#F7F8FA]">{children}</div>;
}
