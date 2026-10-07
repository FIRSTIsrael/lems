import { Suspense } from 'react';
import { InsightsView } from './components/insights-view';

export default function InsightsPage() {
  return (
    <Suspense>
      <InsightsView />
    </Suspense>
  );
}
