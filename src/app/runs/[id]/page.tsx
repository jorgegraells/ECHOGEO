import { notFound } from 'next/navigation';

import { MeasurementReport } from '@/components/features/measurements';
import { getMeasurement } from '@/lib/services/measurement';

export const dynamic = 'force-dynamic';

export default async function RunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = getMeasurement(id);
  if (!result) notFound();

  return <MeasurementReport result={result} />;
}
