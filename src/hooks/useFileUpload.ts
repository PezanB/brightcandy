
import * as XLSX from 'xlsx';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useFileUpload = (setBaseData: (data: any[]) => void) => {
  const { toast } = useToast();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to upload data');
      }

      let allData: any[] = [];
      let uploadedFiles: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Processing file: ${file.name}`);
        
        let jsonData;
        let fileType;

        if (file.name.endsWith('.json')) {
          const text = await file.text();
          jsonData = JSON.parse(text);
          fileType = 'json';
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          const data = await file.arrayBuffer();
          const workbook = XLSX.read(data);
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          jsonData = XLSX.utils.sheet_to_json(worksheet);
          fileType = file.name.endsWith('.xlsx') ? 'xlsx' : 'xls';
        } else if (file.name.endsWith('.csv')) {
          const text = await file.text();
          const workbook = XLSX.read(text, { type: 'string' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          jsonData = XLSX.utils.sheet_to_json(worksheet);
          fileType = 'csv';
        } else {
          console.warn(`Skipping unsupported file: ${file.name}`);
          continue;
        }

        console.log(`File ${file.name} processed, rows: ${jsonData.length}`);
        
        // Store each file's data in Supabase
        const { error } = await supabase
          .from('uploaded_data')
          .insert({
            file_name: file.name,
            file_type: fileType,
            data: jsonData,
            user_id: user.id
          });

        if (error) {
          console.error(`Error storing file ${file.name}:`, error);
          throw error;
        }

        uploadedFiles.push(file.name);
        allData = [...allData, ...jsonData];
      }

      setBaseData(allData);
      
      // Show immediate feedback for successful upload
      toast({
        title: "Upload Successful",
        description: `${uploadedFiles.length} file(s) uploaded:
          ${uploadedFiles.map(name => `\n• ${name}`).join('')}
          \nTotal rows: ${allData.length}. You can now ask questions about your data!`,
        duration: 5000, // Show for 5 seconds
      });

    } catch (error) {
      console.error('Error uploading data:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload data. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }

    // Clear the file input for next upload
    if (event.target) {
      event.target.value = '';
    }
  };

  return { handleUpload };
};
