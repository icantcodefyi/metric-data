import React, { useEffect, useState } from 'react';
import MetricGrid from '@/components/ChartGrid';

export default function Home() {
  const [metrics, setMetrics] = useState([]);
  const [segments, setSegments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [metricsResponse, segmentsResponse] = await Promise.all([
        fetch('https://sundial-fe-interview.vercel.app/api/metrics'),
        fetch('https://sundial-fe-interview.vercel.app/api/segments')
      ]);
      const metricsData = await metricsResponse.json();
      const segmentsData = await segmentsResponse.json();
      setMetrics(metricsData.data);
      setSegments(segmentsData.data);
    };
    fetchData();
  }, []);

  if (!metrics.length || !segments.length) return <div>Loading...</div>;

  return (
    <main className=" min-h-screen mx-auto p-4 ">
      <MetricGrid metrics={metrics} segments={segments} />
    </main>
  );
}