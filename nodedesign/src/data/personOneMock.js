import { mockCurriculumData } from './mockData';

export const personOneContractData = {
  student: {
    id: 'student-101',
    name: 'Alex Rivera',
    grade: 'Algebra II',
  },
  nodes: mockCurriculumData,
  diagnostics: {
    gapDetected: true,
    currentNode: 'quadratic',
    gapNode: 'fractions',
    path: ['quadratic', 'linear-eq', 'algebra', 'ratios', 'fractions'],
    evidence: [
      '6 failed attempts',
      'High time-to-mastery',
      'Failed prerequisite dependency',
    ],
    recommendation: 'Fraction Operations',
  },
};
