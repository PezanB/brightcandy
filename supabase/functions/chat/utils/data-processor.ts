
// Helper function to summarize data for context
export const summarizeData = (data: any[]) => {
  if (!data || data.length === 0) return "No data available";
  
  // Get all column names from the first row
  const columns = Object.keys(data[0]);
  
  // Calculate basic statistics for numeric columns
  const stats: Record<string, any> = {};
  columns.forEach(column => {
    const values = data.map(row => row[column]);
    if (typeof values[0] === 'number') {
      const sum = values.reduce((a, b) => a + b, 0);
      stats[column] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: sum / values.length,
        total: sum
      };
    } else if (typeof values[0] === 'string') {
      const uniqueValues = new Set(values);
      stats[column] = {
        uniqueValues: uniqueValues.size,
        examples: Array.from(uniqueValues).slice(0, 3)
      };
    }
  });

  return {
    summary: `Dataset Summary:
    Total Records: ${data.length}
    Columns: ${columns.join(', ')}
    Column Statistics: ${JSON.stringify(stats, null, 2)}`,
    columns,
    stats
  };
};

// Helper function to generate chart data for visualization
export const generateChartData = (baseData: any[], dataContext: any) => {
  if (!baseData || baseData.length === 0 || !dataContext || !dataContext.stats) {
    return null;
  }
  
  // Get numeric columns for potential visualization
  const numericColumns = Object.keys(dataContext.stats).filter(
    col => dataContext.stats[col].avg !== undefined
  );
  
  if (numericColumns.length === 0) {
    return null;
  }
  
  // Generate chart data for the first 10 rows (or less if fewer rows exist)
  const chartData = baseData.slice(0, Math.min(10, baseData.length)).map(row => {
    const chartRow: any = { name: row[dataContext.columns[0]] || 'Unnamed' };
    numericColumns.forEach(col => {
      chartRow[col] = row[col];
    });
    return chartRow;
  });
  
  return chartData.length > 0 ? chartData : null;
};

// Generate fallback chart data when automatic generation fails
export const generateFallbackChartData = (baseData: any[]) => {
  if (!baseData || baseData.length === 0) return null;
  
  const firstRow = baseData[0];
  const columns = Object.keys(firstRow);
  
  // Find potential numeric columns
  const potentialNumericColumns = columns.filter(col => 
    typeof firstRow[col] === 'number' || 
    !isNaN(parseFloat(firstRow[col]))
  );
  
  if (potentialNumericColumns.length === 0) return null;
  
  // Use the first non-numeric column as the name if available, otherwise use index
  const nameColumn = columns.find(col => 
    typeof firstRow[col] === 'string' && isNaN(parseFloat(firstRow[col]))
  ) || 'index';
  
  return baseData.slice(0, 10).map((row, index) => {
    const chartRow: any = { 
      name: nameColumn === 'index' ? `Item ${index + 1}` : row[nameColumn] || `Item ${index + 1}`
    };
    
    potentialNumericColumns.forEach(col => {
      // Ensure we're storing numeric values
      const value = typeof row[col] === 'number' ? 
        row[col] : 
        parseFloat(row[col]) || 0;
      
      chartRow[col] = value;
    });
    
    return chartRow;
  });
};
