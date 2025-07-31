import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface PriceFilterProps {
  minPrice: number;
  maxPrice: number;
  currentMin: number;
  currentMax: number;
  onPriceChange: (min: number, max: number) => void;
}

export const PriceFilter: React.FC<PriceFilterProps> = ({
  minPrice,
  maxPrice,
  currentMin,
  currentMax,
  onPriceChange,
}) => {
  const handleSliderChange = (values: number[]) => {
    onPriceChange(values[0], values[1]);
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-muted-foreground">
        Price Range: ₹{currentMin} - ₹{currentMax}
      </Label>
      <Slider
        min={minPrice}
        max={maxPrice}
        step={10}
        value={[currentMin, currentMax]}
        onValueChange={handleSliderChange}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>₹{minPrice}</span>
        <span>₹{maxPrice}</span>
      </div>
    </div>
  );
};