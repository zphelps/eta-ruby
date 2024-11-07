# Cloud Functions Configuration

## CORS Configuration

The `cors.json` file is used to configure Cross-Origin Resource Sharing (CORS) settings for the Google Cloud Storage bucket. This configuration allows your frontend application to interact with the storage bucket while adhering to security policies.

Make sure to update the `cors.json` file with the correct origin URLs. The `origin` array should contain the URLs of your frontend application.

Use the following command to deploy the CORS configuration:

```bash
gcloud storage buckets update gs://<bucket-name> --cors-file=<path-to-cors-file>.json
```


## Environment Variables

The `index.js` file requires the following environment variables:

- `SUPABASE_URL`: The URL of your Supabase database.
- `SUPABASE_ANON_KEY`: The anonymous key for your Supabase database.