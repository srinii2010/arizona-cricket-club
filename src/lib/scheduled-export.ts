import { exportToExcel, getDailyExportData } from './excel-export';

export async function runDailyExport() {
  try {
    console.log('Starting daily export...');
    
    // Get all data
    const data = await getDailyExportData();
    
    // Export to Excel and send via email
    const result = await exportToExcel(
      data.members,
      data.memberDues,
      data.generalExpenses,
      'daily'
    );

    if (result.success) {
      console.log('Daily export completed successfully:', {
        fileName: result.fileName,
        recipients: result.recipients,
        messageId: result.messageId,
      });
      return result;
    } else {
      console.error('Daily export failed:', result.error);
      return result;
    }
  } catch (error) {
    console.error('Error in daily export:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Function to check if export should run (daily at 6 PM)
export function shouldRunDailyExport(): boolean {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  // Run at 6 PM (18:00)
  return hour === 18 && minute === 0;
}

// Function to run export on data changes
export async function runExportOnDataChange(changeType: 'member' | 'member_due' | 'general_expense') {
  try {
    console.log(`Running export due to ${changeType} change...`);
    
    // Get all data
    const data = await getDailyExportData();
    
    // Export to Excel and send via email
    const result = await exportToExcel(
      data.members,
      data.memberDues,
      data.generalExpenses,
      'data_change',
      changeType
    );
    
    if (result.success) {
      console.log(`Export completed after ${changeType} change:`, {
        fileName: result.fileName,
        recipients: result.recipients,
        messageId: result.messageId,
      });
    } else {
      console.error(`Export failed after ${changeType} change:`, result.error);
    }
    
    return result;
  } catch (error) {
    console.error(`Error running export after ${changeType} change:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
