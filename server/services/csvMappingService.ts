import { parse } from 'csv-parse/sync';
import { supabaseAdmin } from './supabase.js';
import { logger } from '../utils/logger.js';

export interface CsvMappingRow {
  lesson_id: string;
  video_filename: string;
  status?: string;
}

export const csvMappingService = {
  /**
   * Processes CSV content and maps MP4 video filenames to lesson IDs
   */
  async processCsvMapping(csvContent: string): Promise<{ successCount: number; errors: string[] }> {
    const errors: string[] = [];
    let successCount = 0;

    try {
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      }) as CsvMappingRow[];

      for (let i = 0; i < records.length; i++) {
        const row = records[i];
        if (!row.lesson_id || !row.video_filename) {
          errors.push(`Row ${i + 1}: Missing lesson_id or video_filename`);
          continue;
        }

        const lessonId = row.lesson_id.trim();
        const videoFilename = row.video_filename.trim();
        const status = (row.status || 'available').trim();

        // Update lesson record with storage key
        const videoKey = `videos/${videoFilename}`;

        const { error } = await supabaseAdmin
          .from('lessons')
          .update({
            video_storage_key: videoKey,
            video_status: status
          })
          .eq('id', lessonId);

        if (error) {
          errors.push(`Row ${i + 1} (${lessonId}): ${error.message}`);
        } else {
          successCount++;
        }
      }
    } catch (err: unknown) {
      logger.error('CSV Parsing Error', err);
      errors.push(`CSV Syntax Error: ${(err as Error).message}`);
    }

    return { successCount, errors };
  }
};
