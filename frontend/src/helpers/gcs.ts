import { SaveOptions, Storage } from "@google-cloud/storage";
import * as fs from "node:fs";
import path from "node:path";

const storage = new Storage();

export const uploadFileToGCS = async (file: File, bucket: string, options: SaveOptions, entry_id: string, notebook_id: string) => {
    await storage.bucket(bucket).file(file.name).save(file.bytes(), {
        ...options,
        metadata: {
            entry_id,
            notebook_id,
        },
    });
    return {
        url: `https://storage.googleapis.com/${bucket}/${file.name}`,
        gcsPath: `gs://${bucket}/${file.name}`,
    };
}
