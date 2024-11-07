const { Storage } = require('@google-cloud/storage');

const storage = new Storage();

exports.uploadFileToGCS = async (fileBuffer, metadata, bucketName, prefixPath) => {
    const bucket = storage.bucket(bucketName);

    // Define the destination path
    const destination = `${prefixPath}/${metadata.fileName}`;

    const file = bucket.file(destination);

    // Pass the metadata object directly
    await file.save(fileBuffer, { metadata });

    console.log(`File uploaded to ${bucketName}/${destination}`);

    // Optionally, make the file public and return its URL
    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
    return publicUrl;
};