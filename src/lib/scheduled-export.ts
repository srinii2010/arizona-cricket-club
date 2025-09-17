import { exportToExcel, getDailyExportData } from './excel-export';
import { isAutoExportEnabled, isExportCooldownActive, setLastExportTime, getLastExportTime } from './system-settings';
import { hasDataChangedSince } from './export-tracker';

export async function runDailyExport() {
  try {
    console.log('Starting daily export at 11 PM Phoenix time...');
    
    // Check if auto export is enabled
    const isEnabled = await isAutoExportEnabled();
    if (!isEnabled) {
      console.log('Auto export is disabled. Skipping daily export.');
      return { success: true, message: 'Auto export is disabled' };
    }
    
    // Check if we're in cooldown period
    const inCooldown = await isExportCooldownActive();
    if (inCooldown) {
      console.log('Export is in cooldown period. Skipping daily export.');
      return { success: true, message: 'Export in cooldown period' };
    }
    
    // Check if there have been changes since last export
    const lastExportTime = await getLastExportTime();
    if (lastExportTime) {
      const hasChanges = await hasDataChangedSince(lastExportTime);
      if (!hasChanges) {
        console.log('No changes detected since last export. Skipping daily export.');
        await setLastExportTime(); // Update time even if no export
        return { success: true, message: 'No changes detected, export skipped' };
      }
    }
    
    // Get current data
    const data = await getDailyExportData();
    const totalRecords = data.members.length + data.memberDues.length + data.generalExpenses.length;
    
    // Export to Excel and send via email
    const result = await exportToExcel(
      data.members,
      data.memberDues,
      data.generalExpenses,
      'daily'
    );

    // Update last export time
    await setLastExportTime();

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

// Function to check if export should run (daily at 11 PM Phoenix time)
export function shouldRunDailyExport(): boolean {
  // Get current time in Phoenix timezone
  const now = new Date();
  const phoenixTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Phoenix"}));
  const hour = phoenixTime.getHours();
  const minute = phoenixTime.getMinutes();
  
  // Run at 11 PM Phoenix time (23:00)
  return hour === 23 && minute === 0;
}

// Function to log data changes (no immediate export - scheduled for 11 PM)
export async function runExportOnDataChange(changeType: 'member' | 'member_due' | 'general_expense') {
  try {
    console.log(`Data change detected: ${changeType}. Will be included in next 11 PM export.`);
    // Don't send immediate export, just log the change
    // The 11 PM scheduled export will pick up all changes
    return { success: true, message: 'Change logged, will be included in next 11 PM export' };
  } catch (error) {
    console.error(`Error logging ${changeType} change:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
