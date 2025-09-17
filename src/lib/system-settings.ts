import { supabaseAdmin } from './supabase';

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export async function getSystemSetting(key: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .single();

    if (error) {
      console.error(`Error fetching system setting ${key}:`, error);
      return null;
    }

    return data?.setting_value || null;
  } catch (error) {
    console.error(`Error in getSystemSetting for ${key}:`, error);
    return null;
  }
}

export async function setSystemSetting(key: string, value: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('system_settings')
      .upsert({
        setting_key: key,
        setting_value: value,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error(`Error setting system setting ${key}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error in setSystemSetting for ${key}:`, error);
    return false;
  }
}

export async function isAutoExportEnabled(): Promise<boolean> {
  const enabled = await getSystemSetting('auto_export_enabled');
  return enabled === 'true';
}

export async function getExportCooldownMinutes(): Promise<number> {
  const cooldown = await getSystemSetting('export_cooldown_minutes');
  return cooldown ? parseInt(cooldown) : 5; // Default 5 minutes
}

export async function getLastExportTime(): Promise<string | null> {
  return await getSystemSetting('last_export_time');
}

export async function setLastExportTime(): Promise<boolean> {
  return await setSystemSetting('last_export_time', new Date().toISOString());
}

export async function isExportCooldownActive(): Promise<boolean> {
  const lastExportTime = await getLastExportTime();
  if (!lastExportTime) return false;

  const cooldownMinutes = await getExportCooldownMinutes();
  const lastExport = new Date(lastExportTime);
  const now = new Date();
  const diffMinutes = (now.getTime() - lastExport.getTime()) / (1000 * 60);

  return diffMinutes < cooldownMinutes;
}
