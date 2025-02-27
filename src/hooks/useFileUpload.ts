
import * as XLSX from 'xlsx';
import { useToast } from "@/hooks/use-toast";

export const useFileUpload = (setBaseData: (data: any[]) => void) => {
  const { toast } = useToast();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      let jsonData;

      if (file.name.endsWith('.json')) {
        const text = await file.text();
        jsonData = JSON.parse(text);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        jsonData = XLSX.utils.sheet_to_json(worksheet);
      } else if (file.name.endsWith('.csv')) {
        const text = await file.text();
        const workbook = XLSX.read(text, { type: 'string' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        jsonData = XLSX.utils.sheet_to_json(worksheet);
      } else {
        throw new Error('Unsupported file format');
      }

      setBaseData(jsonData);
      toast({
        title: "Success",
        description: "Data loaded successfully. You can now ask questions about your data!",
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data. Please ensure it's a valid JSON, Excel, or CSV file.",
        variant: "destructive",
      });
    }
  };

  return { handleUpload };
};
