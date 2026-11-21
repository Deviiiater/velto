import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper to determine if store is open given start/end time and isOpen flag
function calculateIsOpen(startTime: string, endTime: string, isOpen: boolean): boolean {
  if (!isOpen) return false;
  if (!startTime || !endTime) return true;

  const now = new Date();
  const currentVal = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  const startVal = (isNaN(startH) ? 8 : startH) * 60 + (isNaN(startM) ? 0 : startM);
  const endVal = (isNaN(endH) ? 22 : endH) * 60 + (isNaN(endM) ? 0 : endM);

  // Normal schedule (e.g., 08:00 to 22:00)
  if (startVal <= endVal) {
    return currentVal >= startVal && currentVal <= endVal;
  }
  // Overnight schedule (e.g., 20:00 to 04:00)
  return currentVal >= startVal || currentVal <= endVal;
}

const DEFAULT_CONFIG = {
  startTime: '08:00',
  endTime: '22:00',
  isOpen: true,
  onlyMedicineEnabled: false
};

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('title', '[STORE_CONFIG]')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.warn('API store-config GET error, returning defaults:', error.message);
      return NextResponse.json({
        ...DEFAULT_CONFIG,
        isStoreOpen: calculateIsOpen(DEFAULT_CONFIG.startTime, DEFAULT_CONFIG.endTime, DEFAULT_CONFIG.isOpen),
        source: 'default_fallback'
      });
    }

    if (data && data.length > 0) {
      try {
        const parsed = JSON.parse(data[0].content);
        const config = {
          startTime: parsed.startTime || DEFAULT_CONFIG.startTime,
          endTime: parsed.endTime || DEFAULT_CONFIG.endTime,
          isOpen: parsed.isOpen !== false,
          onlyMedicineEnabled: !!parsed.onlyMedicineEnabled
        };
        return NextResponse.json({
          ...config,
          isStoreOpen: calculateIsOpen(config.startTime, config.endTime, config.isOpen),
          lastUpdated: data[0].created_at,
          source: 'database'
        });
      } catch (parseErr) {
        console.warn('Failed parsing stored store_config, using defaults');
      }
    }

    return NextResponse.json({
      ...DEFAULT_CONFIG,
      isStoreOpen: calculateIsOpen(DEFAULT_CONFIG.startTime, DEFAULT_CONFIG.endTime, DEFAULT_CONFIG.isOpen),
      source: 'default_unconfigured'
    });
  } catch (err: any) {
    return NextResponse.json(
      { 
        ...DEFAULT_CONFIG,
        isStoreOpen: calculateIsOpen(DEFAULT_CONFIG.startTime, DEFAULT_CONFIG.endTime, DEFAULT_CONFIG.isOpen),
        error: err?.message || 'Server error' 
      },
      { status: 200 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { startTime, endTime, isOpen, onlyMedicineEnabled } = body;

    // Validate inputs
    const validStartTime = typeof startTime === 'string' && /^\d{1,2}:\d{2}$/.test(startTime) ? startTime : '08:00';
    const validEndTime = typeof endTime === 'string' && /^\d{1,2}:\d{2}$/.test(endTime) ? endTime : '22:00';
    const validIsOpen = typeof isOpen === 'boolean' ? isOpen : true;
    const validOnlyMedicine = typeof onlyMedicineEnabled === 'boolean' ? onlyMedicineEnabled : false;

    const configData = {
      startTime: validStartTime,
      endTime: validEndTime,
      isOpen: validIsOpen,
      onlyMedicineEnabled: validOnlyMedicine,
      updatedAt: new Date().toISOString()
    };

    const title = '[STORE_CONFIG]';
    const content = JSON.stringify(configData);

    // Check if a row already exists
    const { data: existingRows } = await supabase
      .from('announcements')
      .select('id')
      .eq('title', title)
      .limit(1);

    if (existingRows && existingRows.length > 0) {
      const { error: updateError } = await supabase
        .from('announcements')
        .update({
          content,
          type: 'announcement',
          created_at: new Date().toISOString()
        })
        .eq('id', existingRows[0].id);

      if (updateError) {
        console.warn('Update failed, attempting insert:', updateError.message);
        await supabase.from('announcements').insert({
          title,
          content,
          type: 'announcement'
        });
      }
    } else {
      const { error: insertError } = await supabase
        .from('announcements')
        .insert({
          title,
          content,
          type: 'announcement'
        });

      if (insertError) {
        throw insertError;
      }
    }

    const isStoreOpen = calculateIsOpen(validStartTime, validEndTime, validIsOpen);

    return NextResponse.json({
      success: true,
      config: configData,
      isStoreOpen,
      message: 'Store timings updated & synced successfully across all platforms!'
    });
  } catch (err: any) {
    console.error('API store-config POST Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to update store timings' },
      { status: 500 }
    );
  }
}
