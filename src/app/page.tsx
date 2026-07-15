import { MeasurementList } from '@/components/features/measurements';
import { listMeasurements } from '@/lib/services/measurement';

// El dashboard lee data/runs/ en cada petición: sin caché, lo que hay en
// disco es lo que se ve.
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return <MeasurementList items={listMeasurements()} />;
}
