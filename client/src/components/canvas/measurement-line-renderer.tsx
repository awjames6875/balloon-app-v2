import type { MeasurementLine } from '@shared/schema';

interface MeasurementLineRendererProps {
  measurements: MeasurementLine[];
  onMeasurementClick?: (measurement: MeasurementLine) => void;
  canvasScale?: number;
}

const MeasurementLineRenderer = ({ 
  measurements, 
  onMeasurementClick,
  canvasScale = 1 
}: MeasurementLineRendererProps) => {
  
  const handleLineClick = (e: React.MouseEvent, measurement: MeasurementLine) => {
    e.stopPropagation();
    if (onMeasurementClick) {
      onMeasurementClick(measurement);
    }
  };

  const calculateMidpoint = (measurement: MeasurementLine) => ({
    x: (measurement.x1 + measurement.x2) / 2,
    y: (measurement.y1 + measurement.y2) / 2
  });

  const calculateAngle = (measurement: MeasurementLine) => {
    const dx = measurement.x2 - measurement.x1;
    const dy = measurement.y2 - measurement.y1;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  if (measurements.length === 0) {
    return null;
  }

  return (
    <svg className="absolute inset-0 pointer-events-none z-10">
      {measurements.map((measurement) => {
        const midpoint = calculateMidpoint(measurement);
        const angle = calculateAngle(measurement);
        
        return (
          <g key={measurement.id}>
            {/* Main measurement line */}
            <line
              x1={measurement.x1}
              y1={measurement.y1}
              x2={measurement.x2}
              y2={measurement.y2}
              stroke={measurement.color || '#ff0000'}
              strokeWidth="2"
              className="pointer-events-auto cursor-pointer hover:stroke-width-3"
              onClick={(e) => handleLineClick(e, measurement)}
            />
            
            {/* Start point marker */}
            <circle
              cx={measurement.x1}
              cy={measurement.y1}
              r="4"
              fill={measurement.color || '#ff0000'}
              className="pointer-events-auto cursor-pointer"
              onClick={(e) => handleLineClick(e, measurement)}
            />
            
            {/* End point marker */}
            <circle
              cx={measurement.x2}
              cy={measurement.y2}
              r="4"
              fill={measurement.color || '#ff0000'}
              className="pointer-events-auto cursor-pointer"
              onClick={(e) => handleLineClick(e, measurement)}
            />
            
            {/* Measurement label */}
            <g
              transform={`translate(${midpoint.x}, ${midpoint.y}) rotate(${angle})`}
              className="pointer-events-auto cursor-pointer"
              onClick={(e) => handleLineClick(e, measurement)}
            >
              {/* Label background */}
              <rect
                x="-40"
                y="-12"
                width="80"
                height="24"
                fill="white"
                stroke={measurement.color || '#ff0000'}
                strokeWidth="1"
                rx="4"
              />
              
              {/* Label text */}
              <text
                x="0"
                y="0"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="10"
                fill="#333"
                fontFamily="sans-serif"
                fontWeight="bold"
              >
                {measurement.realWorldLength} {measurement.unit}
              </text>
            </g>
            
            {/* Measurement name/label below */}
            <text
              x={midpoint.x}
              y={midpoint.y + 20}
              textAnchor="middle"
              fontSize="9"
              fill="#666"
              fontFamily="sans-serif"
              className="pointer-events-auto cursor-pointer"
              onClick={(e) => handleLineClick(e, measurement)}
            >
              {measurement.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default MeasurementLineRenderer;