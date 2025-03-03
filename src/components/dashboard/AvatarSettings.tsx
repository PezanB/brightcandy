
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

type AvatarPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'custom';

interface CustomPosition {
  bottom?: string;
  left?: string;
  right?: string;
  top?: string;
}

interface AvatarSettingsProps {
  position: AvatarPosition;
  customPosition: CustomPosition;
  onPositionChange: (position: AvatarPosition) => void;
  onCustomPositionChange: (position: CustomPosition) => void;
}

export const AvatarSettings = ({
  position,
  customPosition,
  onPositionChange,
  onCustomPositionChange
}: AvatarSettingsProps) => {
  const [open, setOpen] = useState(false);
  
  // Convert pixel values to percentages for sliders
  const getSliderValue = (value: string | undefined) => {
    if (!value) return 0;
    return parseInt(value) / 10; // Convert "20px" to 2 for slider
  };

  // Create new position object with updated value
  const updateCustomPosition = (key: keyof CustomPosition, value: number) => {
    const newValue = `${value * 10}px`; // Convert slider value 2 to "20px"
    onCustomPositionChange({
      ...customPosition,
      [key]: newValue
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-9 w-9 rounded-full"
          aria-label="Avatar settings"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-medium">Avatar Position</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <RadioGroup 
              value={position} 
              onValueChange={(value) => onPositionChange(value as AvatarPosition)}
              className="mb-4"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="bottom-left" id="bottom-left" />
                  <Label htmlFor="bottom-left">Bottom Left</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="bottom-right" id="bottom-right" />
                  <Label htmlFor="bottom-right">Bottom Right</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="top-left" id="top-left" />
                  <Label htmlFor="top-left">Top Left</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="top-right" id="top-right" />
                  <Label htmlFor="top-right">Top Right</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom">Custom Position</Label>
                </div>
              </div>
            </RadioGroup>
            
            <div className={cn(
              "space-y-4 pt-2",
              position !== "custom" && "opacity-50 pointer-events-none"
            )}>
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Bottom</Label>
                  <span className="text-xs text-muted-foreground">{customPosition.bottom || '0px'}</span>
                </div>
                <Slider
                  value={[getSliderValue(customPosition.bottom)]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => updateCustomPosition('bottom', value[0])}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Left</Label>
                  <span className="text-xs text-muted-foreground">{customPosition.left || '0px'}</span>
                </div>
                <Slider
                  value={[getSliderValue(customPosition.left)]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => updateCustomPosition('left', value[0])}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Right</Label>
                  <span className="text-xs text-muted-foreground">{customPosition.right || '0px'}</span>
                </div>
                <Slider
                  value={[getSliderValue(customPosition.right)]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => updateCustomPosition('right', value[0])}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Top</Label>
                  <span className="text-xs text-muted-foreground">{customPosition.top || '0px'}</span>
                </div>
                <Slider
                  value={[getSliderValue(customPosition.top)]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => updateCustomPosition('top', value[0])}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};
