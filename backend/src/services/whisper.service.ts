import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

export class WhisperService {
  private async downloadAudio(youtubeUrl: string, outputDir: string): Promise<string> {
    try {
      const outputFileName = `audio_${Date.now()}.m4a`;
      const outputPath = path.join(outputDir, outputFileName);

      // Ensure the output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      console.log(`Downloading audio from ${youtubeUrl} to ${outputPath}`);
      const command = `yt-dlp -x --audio-format m4a -o "${outputPath}" "${youtubeUrl}"`;
      await execAsync(command);

      console.log(`Audio downloaded to ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error('Error downloading audio:', error);
      throw new Error('Failed to download audio from YouTube.');
    }
  }

  public async transcribe(youtubeUrl: string): Promise<string> {
    const audioOutputDir = path.join(process.cwd(), 'videos', 'downloaded'); // Assuming a 'videos/downloaded' directory
    let audioFilePath: string | undefined;

    try {
      audioFilePath = await this.downloadAudio(youtubeUrl, audioOutputDir);

      console.log(`Starting Whisper transcription for: ${audioFilePath}`);
      // Execute the Python script for transcription
      const command = `../venv/bin/python3 ../whisper_transcribe.py --file_path "${audioFilePath}"`;
      const { stdout, stderr } = await execAsync(command, {
        cwd: process.cwd(),
      });

      console.log('Whisper script stdout:', stdout); // Log stdout
      if (stderr) {
        console.error('Whisper script stderr:', stderr); // Log stderr
      }

      const result = JSON.parse(stdout);

      if (result.status === 'error') {
        throw new Error(result.message);
      }
      
      console.log('Whisper transcription successful.');
      return result.transcript;
    } catch (error) {
      console.error('Error during Whisper transcription process:', error);
      throw new Error('Failed to transcribe audio using Whisper.');
    } finally {
      // Clean up the downloaded audio file
      if (audioFilePath && fs.existsSync(audioFilePath)) {
        fs.unlinkSync(audioFilePath);
        console.log(`Cleaned up downloaded audio file: ${audioFilePath}`);
      }
    }
  }
}
