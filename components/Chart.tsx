import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRef } from 'react';

interface MetricChartProps {
  metric: string;
  segmentKey: string;
  segmentId: string;
  displayName: string;
  metrics: Array<{ id: string; displayName: string }>;
  segments: Array<{ segmentKey: string; displayName: string; values: Array<{ segmentId: string; displayName: string }> }>;
  onUpdate: (metric: string, segmentKey: string, segmentId: string) => void;
}

const MetricChart: React.FC<MetricChartProps> = ({
  metric, segmentKey, segmentId, displayName, metrics, segments, onUpdate
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(metric);
  const [selectedSegment, setSelectedSegment] = useState(segmentId);
  const [data, setData] = useState<Array<{ value: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://sundial-fe-interview.vercel.app/api/snapshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metric, segmentKey, segmentId }),
        });
        const result = await response.json();
        setData(result.data.values);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [metric, segmentKey, segmentId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsEditMode(false);
        setSelectedMetric(metric);
        setSelectedSegment(segmentId);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [metric, segmentId]);

  const handleSave = () => {
    onUpdate(selectedMetric, segmentKey, selectedSegment);
    setIsEditMode(false);
  };

  if (isEditMode) {
    return (
      <Card className="w-full bg-white rounded-xl shadow-sm h-[250px]">
        <CardContent className="p-4">
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className='mb-3'>
              <SelectValue placeholder="Select Metric" />
            </SelectTrigger>
            <SelectContent>
              {metrics.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.displayName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSegment} onValueChange={setSelectedSegment}>
            <SelectTrigger>
              <SelectValue placeholder="Select Segment" />
            </SelectTrigger>
            <SelectContent>
              {segments.flatMap(group =>
                group.values.map(segment => (
                  <SelectItem key={segment.segmentId} value={segment.segmentId}>{segment.displayName}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <div className='flex justify-center gap-2'>
            <Button onClick={() => setIsEditMode(false)} className="mt-4 bg-red-200 hover:bg-red-300 text-red-600 w-[100px]">Cancel</Button>
            <Button onClick={handleSave} className="mt-4 bg-[#119F97] hover:bg-[#119F97]/80 text-white w-[100px]">Add</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) return <Card className='w-full bg-white rounded-xl shadow-sm h-[250px] animate-pulse'></Card>;

  const latestValue = data[data.length - 1]?.value;
  const weekAgoValue = data[data.length - 8]?.value;
  const percentageChange = weekAgoValue !== 0 ? ((latestValue - weekAgoValue) / weekAgoValue * 100).toFixed(1) : '0';

  return (
    <Card className="w-full bg-white rounded-3xl shadow-sm h-[250px] overflow-hidden" onClick={() => setIsEditMode(true)}>
      <CardContent className="p-6 flex flex-col h-full">
        <div className="text-sm font-medium text-gray-500 mb-2">{displayName}</div>
        <div className="flex flex-grow items-center">
          <div className="flex-1">
            <div className="text-4xl font-bold">{latestValue?.toLocaleString('en-US', { maximumFractionDigits: 1 })}K</div>
            <div className="text-sm font-medium">↑ {percentageChange}% <span className='text-gray-400'>Δ7d</span></div>
          </div>
          <div className="flex-1 h-full relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent z-10"></div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Area
                  type="linear"
                  dataKey="value"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricChart;