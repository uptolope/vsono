import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ARDMS SPI Exam Simulator — Timed Practice Tests',
  description:
    'Prepare for test day with realistic, timed ARDMS SPI mock exams, detailed rationales, ultrasound physics questions, and score analytics.',
  alternates: {
    canonical: '/exam-simulator',
  },
  openGraph: {
    title: 'ARDMS SPI Exam Simulator — Timed Practice Tests',
    description:
      'Practice ultrasound physics with realistic timed ARDMS SPI mock exams and detailed answer explanations.',
    url: 'https://www.sonoprep.com/exam-simulator',
    type: 'website',
  },
};

export default function ExamSimulatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
