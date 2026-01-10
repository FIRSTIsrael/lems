'use client';

import { ExportRubric } from '../../../../../components/export';

export default function RubricExportPage() {
  // Mock data for demonstration
  const mockRubrics = [
    {
      divisionName: 'Division A',
      teamNumber: 1690,
      teamName: 'Orbit',
      rubricCategory: 'Innovation Project',
      scores: {
        'Problem Definition': 8,
        'Solution Design': 9,
        Implementation: 8,
        Presentation: 9
      }
    }
  ];

  return (
    <div>
      {mockRubrics.map((rubric, index) => (
        <ExportRubric
          key={index}
          divisionName={rubric.divisionName}
          teamNumber={rubric.teamNumber}
          teamName={rubric.teamName}
          rubricCategory={rubric.rubricCategory}
          scores={rubric.scores}
          showFeedback={true}
        />
      ))}
    </div>
  );
}
