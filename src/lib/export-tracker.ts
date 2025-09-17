import { supabaseAdmin } from './supabase';

export interface ExportHistory {
  id: string;
  export_date: string;
  export_type: 'daily' | 'data_change';
  has_changes: boolean;
  records_exported: number;
  created_at: string;
}

export async function getLastExportDate(exportType: 'daily' | 'data_change' = 'daily'): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('export_history')
      .select('export_date')
      .eq('export_type', exportType)
      .eq('has_changes', true)
      .order('export_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching last export date:', error);
      return null;
    }

    return data?.export_date || null;
  } catch (error) {
    console.error('Error in getLastExportDate:', error);
    return null;
  }
}

export async function recordExport(exportType: 'daily' | 'data_change', hasChanges: boolean, recordsCount: number): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('export_history')
      .insert([{
        export_date: new Date().toISOString().split('T')[0],
        export_type: exportType,
        has_changes: hasChanges,
        records_exported: recordsCount,
      }]);

    if (error) {
      console.error('Error recording export:', error);
    }
  } catch (error) {
    console.error('Error in recordExport:', error);
  }
}

export async function hasDataChangedSince(lastExportDate: string | null): Promise<boolean> {
  if (!lastExportDate) {
    return true; // If no previous export, consider it as changed
  }

  try {
    // Check if any data has been modified since last export
    const { data: members, error: membersError } = await supabaseAdmin
      .from('members')
      .select('updated_at')
      .gt('updated_at', lastExportDate)
      .limit(1);

    const { data: memberDues, error: duesError } = await supabaseAdmin
      .from('member_dues')
      .select('updated_at')
      .gt('updated_at', lastExportDate)
      .limit(1);

    const { data: expenses, error: expensesError } = await supabaseAdmin
      .from('general_expenses')
      .select('updated_at')
      .gt('updated_at', lastExportDate)
      .limit(1);

    if (membersError || duesError || expensesError) {
      console.error('Error checking for data changes:', { membersError, duesError, expensesError });
      return true; // If error, assume there are changes to be safe
    }

    return (members && members.length > 0) || 
           (memberDues && memberDues.length > 0) || 
           (expenses && expenses.length > 0);
  } catch (error) {
    console.error('Error in hasDataChangedSince:', error);
    return true; // If error, assume there are changes to be safe
  }
}
