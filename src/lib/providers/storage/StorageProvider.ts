export interface UploadOptions {
  folder?: string;
  isPublic?: boolean;
}

export interface StorageProvider {
  readonly name: string;
  uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    contentType: string,
    options?: UploadOptions
  ): Promise<string>;
  getDownloadUrl(key: string): Promise<string>;
  getSignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
  deleteFile(key: string): Promise<boolean>;
}
