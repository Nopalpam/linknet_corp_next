/**
 * File Upload Security Scanner Service
 * Control: MBSS2.0-ApplicationCoding-003 - File scanning before upload/transfer
 * 
 * This service provides malware and security scanning for uploaded files
 * before they are stored in the cloud storage or database.
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';
import os from 'os';
import path from 'path';
import fs from 'fs/promises';

const execFileAsync = promisify(execFile);

interface ScanResult {
  safe: boolean;
  scannedAt: Date;
  scanner: string;
  threats?: string[];
  fileHash: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export class FileUploadScanner {
  private readonly maxFileSize = 100 * 1024 * 1024; // 100MB
  private readonly antivirusRequired =
    process.env.ANTIVIRUS_REQUIRED === 'true' ||
    (process.env.NODE_ENV === 'production' && process.env.ANTIVIRUS_REQUIRED !== 'false');
  private readonly allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Video
    'video/mp4',
    'video/webm',
    'video/quicktime',
  ];

  private readonly dangerousExtensions = [
    '.exe',
    '.dll',
    '.bat',
    '.cmd',
    '.sh',
    '.ps1',
    '.vbs',
    '.scr',
    '.msi',
    '.jar',
    '.com',
    '.asp',
    '.aspx',
    '.cgi',
    '.htm',
    '.html',
    '.jsp',
    '.jspx',
    '.php',
    '.phtml',
    '.pl',
    '.py',
    '.rb',
    '.svg',
  ];

  /**
   * Scan uploaded file for security threats
   */
  async scanFile(filePath: string, originalName: string, mimeType: string): Promise<ScanResult> {
    console.log(`🔒 Scanning file: ${originalName}`);

    // 1. Basic file validation
    await this.validateFile(filePath, originalName, mimeType);

    // 2. Calculate file hash (for duplicate detection and integrity)
    const fileHash = await this.calculateFileHash(filePath);

    // 3. Check file extension
    this.checkFileExtension(originalName);

    // 4. MIME type validation
    this.validateMimeType(mimeType);

    // 5. File size check
    const fileSize = await this.getFileSize(filePath);

    // 6. Virus scan (if ClamAV available)
    const virusScanResult = await this.scanWithClamAV(filePath);

    // 7. Content analysis for suspicious patterns
    const contentAnalysisResult = await this.analyzeFileContent(filePath, mimeType);

    // Combine results
    const threats: string[] = [];
    if (virusScanResult.threats) {
      threats.push(...virusScanResult.threats);
    }
    if (contentAnalysisResult.threats) {
      threats.push(...contentAnalysisResult.threats);
    }

    const result: ScanResult = {
      safe: threats.length === 0,
      scannedAt: new Date(),
      scanner: 'FileUploadScanner v1.0',
      threats: threats.length > 0 ? threats : undefined,
      fileHash,
      fileName: originalName,
      fileSize,
      mimeType,
    };

    if (!result.safe) {
      console.error(`❌ File scan failed for ${originalName}:`, threats);
      // Log to security audit log
      await this.logSecurityEvent('FILE_SCAN_FAILED', result);
    } else {
      console.log(`✅ File scan passed for ${originalName}`);
    }

    return result;
  }

  /**
   * Scan an in-memory Multer file before it is transferred to storage.
   */
  async scanBuffer(file: Express.Multer.File): Promise<ScanResult> {
    this.validateMemoryFile(file);
    this.checkFileExtension(file.originalname);
    this.validateMimeType(file.mimetype);

    const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
    const virusScanResult = await this.scanBufferWithClamAV(file);
    const contentAnalysisResult = this.analyzeBufferContent(file.buffer, file.mimetype);
    const threats = [
      ...(virusScanResult.threats || []),
      ...(contentAnalysisResult.threats || []),
    ];

    const result: ScanResult = {
      safe: threats.length === 0,
      scannedAt: new Date(),
      scanner: 'FileUploadScanner v1.0',
      threats: threats.length > 0 ? threats : undefined,
      fileHash,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    };

    if (!result.safe) {
      await this.logSecurityEvent('FILE_SCAN_FAILED', result);
    }

    return result;
  }

  private async scanBufferWithClamAV(
    file: Express.Multer.File
  ): Promise<{ safe: boolean; threats?: string[] }> {
    const tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'linknet-upload-scan-'));
    const tempFilename = path.basename(file.originalname.replace(/\\/g, '/')) || 'upload.bin';
    const tempFilePath = path.join(tempDirectory, tempFilename);

    try {
      await fs.writeFile(tempFilePath, file.buffer);
      return await this.scanWithClamAV(tempFilePath);
    } finally {
      await fs.rm(tempDirectory, { recursive: true, force: true }).catch(() => undefined);
    }
  }

  private handleAntivirusUnavailable(message: string): { safe: boolean; threats?: string[] } {
    if (this.antivirusRequired) {
      return {
        safe: false,
        threats: [message],
      };
    }

    console.warn(message);
    return { safe: true };
  }

  private validateMemoryFile(file: Express.Multer.File): void {
    if (!file.buffer || file.buffer.length === 0) {
      throw new Error('File is empty');
    }

    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size (${this.maxFileSize / 1024 / 1024}MB)`);
    }
  }

  private analyzeBufferContent(
    buffer: Buffer,
    mimeType: string
  ): { safe: boolean; threats?: string[] } {
    const threats: string[] = [];
    const magicNumbers: Record<string, string[]> = {
      'image/jpeg': ['ffd8ff'],
      'image/png': ['89504e47'],
      'image/gif': ['474946383761', '474946383961'],
      'application/pdf': ['255044462d'],
      'application/zip': ['504b0304', '504b0506', '504b0708'],
    };

    const expectedSignatures = magicNumbers[mimeType];
    if (expectedSignatures) {
      const fileSignature = buffer.toString('hex', 0, 8);
      const matches = expectedSignatures.some((sig) => fileSignature.startsWith(sig));
      if (!matches) {
        threats.push(`MIME type mismatch: Expected ${mimeType} but file signature does not match`);
      }
    }

    if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
      const content = buffer.subarray(0, 1024 * 1024).toString('utf8');
      const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /onerror=/i,
        /onload=/i,
        /eval\(/i,
        /document\.write/i,
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(content)) {
          threats.push(`Suspicious script pattern detected: ${pattern.source}`);
        }
      }
    }

    return {
      safe: threats.length === 0,
      threats: threats.length > 0 ? threats : undefined,
    };
  }

  /**
   * Validate basic file properties
   */
  private async validateFile(
    filePath: string,
    _originalName: string,
    _mimeType: string
  ): Promise<void> {
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      throw new Error('File not found or inaccessible');
    }

    // Check file size
    const stats = await fs.stat(filePath);
    if (stats.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size (${this.maxFileSize / 1024 / 1024}MB)`);
    }

    if (stats.size === 0) {
      throw new Error('File is empty');
    }
  }

  /**
   * Calculate SHA-256 hash of file
   */
  private async calculateFileHash(filePath: string): Promise<string> {
    const fileBuffer = await fs.readFile(filePath);
    const hash = crypto.createHash('sha256');
    hash.update(fileBuffer);
    return hash.digest('hex');
  }

  /**
   * Check for dangerous file extensions
   */
  private checkFileExtension(fileName: string): void {
    const normalized = fileName.replace(/\\/g, '/');
    const basename = path.posix.basename(normalized);
    if (!basename || basename !== normalized || /[\x00-\x1F\x7F]/.test(fileName)) {
      throw new Error('Invalid file name');
    }

    const ext = path.extname(basename).toLowerCase();
    if (this.dangerousExtensions.includes(ext)) {
      throw new Error(`Dangerous file extension detected: ${ext}`);
    }

    // Check for double extensions (e.g., file.pdf.exe)
    const parts = basename.split('.');
    if (parts.length > 2) {
      const secondExt = '.' + parts[parts.length - 2]!.toLowerCase();
      if (this.dangerousExtensions.includes(secondExt)) {
        throw new Error(`Suspicious double extension detected: ${fileName}`);
      }
    }
  }

  /**
   * Validate MIME type
   */
  private validateMimeType(mimeType: string): void {
    if (!this.allowedMimeTypes.includes(mimeType)) {
      throw new Error(`MIME type not allowed: ${mimeType}`);
    }
  }

  /**
   * Get file size
   */
  private async getFileSize(filePath: string): Promise<number> {
    const stats = await fs.stat(filePath);
    return stats.size;
  }

  /**
   * Scan file with ClamAV antivirus (if available)
   */
  private async scanWithClamAV(filePath: string): Promise<{ safe: boolean; threats?: string[] }> {
    try {
      await execFileAsync('clamscan', ['--version'], { timeout: 5000 });

      const { stdout } = await execFileAsync('clamscan', ['--no-summary', filePath], {
        timeout: 120000,
        maxBuffer: 1024 * 1024,
      });

      // Parse results
      if (stdout.includes('FOUND')) {
        const threats = stdout
          .split('\n')
          .filter((line) => line.includes('FOUND'))
          .map((line) => line.split(':')[1]!.trim());
        return { safe: false, threats };
      }

      return { safe: true };
    } catch (error: any) {
      // ClamAV not installed or scan failed
      if (error.code === 'ENOENT') {
        return this.handleAntivirusUnavailable(
          'ClamAV is not installed. Install clamav in the runtime image or set ANTIVIRUS_REQUIRED=false only for trusted non-production environments.'
        );
      }

      // Scan found threats
      if (error.stdout && error.stdout.includes('FOUND')) {
        const threats = error.stdout
          .split('\n')
          .filter((line: string) => line.includes('FOUND'))
          .map((line: string) => line.split(':')[1]!.trim());
        return { safe: false, threats };
      }

      return this.handleAntivirusUnavailable(
        `ClamAV scan could not be completed: ${error instanceof Error ? error.message : 'unknown error'}`
      );
    }
  }

  /**
   * Analyze file content for suspicious patterns
   */
  private async analyzeFileContent(
    filePath: string,
    mimeType: string
  ): Promise<{ safe: boolean; threats?: string[] }> {
    const threats: string[] = [];

    // Read first 512 bytes for magic number validation
    const buffer = Buffer.alloc(512);
    const fd = await fs.open(filePath, 'r');
    await fd.read(buffer, 0, 512, 0);
    await fd.close();

    // Magic number validation
    const magicNumbers: Record<string, string[]> = {
      'image/jpeg': ['ffd8ff'],
      'image/png': ['89504e47'],
      'image/gif': ['474946383761', '474946383961'],
      'application/pdf': ['255044462d'],
      'application/zip': ['504b0304', '504b0506', '504b0708'],
    };

    const fileSignature = buffer.toString('hex', 0, 8);
    const expectedSignatures = magicNumbers[mimeType];

    if (expectedSignatures) {
      const matches = expectedSignatures.some((sig) => fileSignature.startsWith(sig));
      if (!matches) {
        threats.push(`MIME type mismatch: Expected ${mimeType} but file signature doesn't match`);
      }
    }

    // Check for embedded scripts in images/PDFs
    if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
      const content = await fs.readFile(filePath, 'utf8');
      const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /onerror=/i,
        /onload=/i,
        /eval\(/i,
        /document\.write/i,
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(content)) {
          threats.push(`Suspicious script pattern detected: ${pattern.source}`);
        }
      }
    }

    return {
      safe: threats.length === 0,
      threats: threats.length > 0 ? threats : undefined,
    };
  }

  /**
   * Log security event to audit log
   */
  private async logSecurityEvent(eventType: string, data: any): Promise<void> {
    try {
      // In production, this should write to your log_activities table or security log service
      const logEntry = {
        timestamp: new Date().toISOString(),
        eventType,
        data: JSON.stringify(data),
        severity: 'HIGH',
      };

      console.error('🚨 SECURITY EVENT:', logEntry);

      // TODO: Implement database logging
      // await prisma.logActivity.create({...});
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Quick validation for file upload middleware
   */
  static async quickValidate(file: Express.Multer.File): Promise<boolean> {
    const scanner = new FileUploadScanner();

    try {
      // Quick checks only
      scanner.checkFileExtension(file.originalname);
      scanner.validateMimeType(file.mimetype);

      const stats = await fs.stat(file.path);
      if (stats.size > scanner['maxFileSize']) {
        throw new Error('File too large');
      }

      return true;
    } catch (error) {
      console.error('Quick validation failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const fileUploadScanner = new FileUploadScanner();
