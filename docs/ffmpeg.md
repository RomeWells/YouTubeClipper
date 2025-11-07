# FFmpeg and Video Processing Documentation

This document outlines the usage of FFmpeg and the video processing workflow within the YouTube Viral Clipper backend.

## Overview

The backend utilizes `youtube-dl-exec` (a Node.js wrapper for `yt-dlp`) to download YouTube videos and `fluent-ffmpeg` (a Node.js wrapper for FFmpeg) to extract viral clips identified by the Gemini AI. These processed video files are stored locally and served to the frontend for preview and eventual YouTube upload.

## Important Considerations

*   **FFmpeg and yt-dlp Installation:** Ensure both FFmpeg and yt-dlp are installed and accessible in the system's PATH where the backend is running. `fluent-ffmpeg` relies on a globally available FFmpeg executable, and `youtube-dl-exec` relies on `yt-dlp`.
*   **Error Handling:** Robust error handling is implemented in `video.service.ts` to catch issues during video download and clip extraction.
*   **Resource Management:** Downloading and processing videos can be resource-intensive. Consider implementing queuing mechanisms or limiting concurrent video processing in a production environment.
*   **Temporary Files:** The `downloaded` directory can grow large. A strategy for cleaning up old downloaded full videos (after clips are extracted or after a certain period) should be considered.


## Folder Structure for Video Files

All video-related files (downloaded full videos and extracted clips) are stored within the `backend/videos` directory. This directory is further organized into two subdirectories:

*   `backend/videos/downloaded`: This directory stores the full YouTube videos downloaded from the provided URLs. Each video is saved with its `videoId` as the filename (e.g., `VIDEO_ID.mp4`).
*   `backend/videos/extracted`: This directory stores the individual viral clips extracted from the downloaded full videos. Each clip is named using a convention that includes the `videoId` and a sequential clip number (e.g., `VIDEO_ID_clip_1.mp4`).

## Video Processing Workflow

1.  **Video Download:**
    *   When a user submits a YouTube URL for analysis, the backend first extracts the `videoId`.
    *   The `downloadVideo` function in `backend/src/services/video.service.ts` is called, which uses `ytdl-core` to download the full video in the highest available quality.
    *   The downloaded video is saved to `backend/videos/downloaded/VIDEO_ID.mp4`.

2.  **Viral Moment Analysis:**
    *   Concurrently with the video download, the Gemini AI analyzes the video's transcript and comments to identify viral moments. This process returns `startTime` and `endTime` for each potential clip.

3.  **Clip Extraction:**
    *   For each identified viral moment, the `extractClip` function in `backend/src/services/video.service.ts` is invoked.
    *   This function uses `fluent-ffmpeg` to precisely cut the segment from the downloaded full video using the `startTime` and `endTime` provided by the AI.
    *   The extracted clip is saved to `backend/videos/extracted/VIDEO_ID_clip_N.mp4` (where N is the clip number).

4.  **Frontend Access:**
    *   The `backend/videos` directory is configured to be served as static files via an Express middleware at the `/videos` endpoint.
    *   The frontend receives the `clipPath` (e.g., `/videos/extracted/VIDEO_ID_clip_1.mp4`) for each extracted clip.
    *   The `VideoPlayer` component in the frontend uses this `clipPath` (prefixed with the backend URL, e.g., `http://localhost:3001/videos/extracted/VIDEO_ID_clip_1.mp4`) to display the extracted clip for preview.

## FFmpeg Usage Details

The `fluent-ffmpeg` library is used to interact with the underlying FFmpeg executable. Key aspects of its usage include:

*   **`setStartTime(startTime)`:** Specifies the starting point of the clip extraction.
*   **`setDuration(durationInSeconds)`:** Specifies the length of the clip to extract. The `calculateDuration` helper function is used to convert `startTime` and `endTime` into a duration in seconds.
*   **`.output(outputPath)`:** Defines the path and filename for the extracted clip.
*   **`.on('end', ...)` and `.on('error', ...)`:** Event listeners are used to handle the completion or failure of the FFmpeg process.

## Important Considerations

*   **FFmpeg Installation:** Ensure FFmpeg is installed and accessible in the system's PATH where the backend is running. `fluent-ffmpeg` relies on a globally available FFmpeg executable.
*   **Error Handling:** Robust error handling is implemented in `video.service.ts` to catch issues during video download and clip extraction.
*   **Resource Management:** Downloading and processing videos can be resource-intensive. Consider implementing queuing mechanisms or limiting concurrent video processing in a production environment.
*   **Temporary Files:** The `downloaded` directory can grow large. A strategy for cleaning up old downloaded full videos (after clips are extracted or after a certain period) should be considered.
