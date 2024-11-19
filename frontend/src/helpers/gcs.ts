import { SaveOptions, Storage } from "@google-cloud/storage";
const storage = new Storage();

export const uploadFileToGCS = async (file: any, bucket: string, options: SaveOptions) => {
    await storage.bucket(bucket).file(file.name).save(file.bytes(), {
        ...options
    });
    return {
        url: `https://storage.googleapis.com/${bucket}/${file.name}`,
        gcsPath: `gs://${bucket}/${file.name}`,
    };
}