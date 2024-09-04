// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import {corsHeaders} from "../_shared/cors";
import { createClient } from 'jsr:@supabase/supabase-js@2'
import {DocumentProcessorServiceClient} from "npm:@google-cloud/documentai@^8.9.0";
import { decode as base64Decode, encode as base64Encode } from 'https://deno.land/std@0.166.0/encoding/base64.ts'

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', {headers: corsHeaders})
    }

    const documentOCRClient = new DocumentProcessorServiceClient({
        credentials: {
            type: "service_account",
            project_id: "eta-ruby",
            private_key_id: "cab8886a2d442a6e1e18d277b9da7c3a89a80c90",
            private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC5S2vOfkFhAzv8\nQ16UitB9q1HhqgCY3I0iKOj4K/hVJyeNHfL5vvMY3vPDN7M0WG1KFac58dtkof3M\nTXgoChzCAAN+MnoU9VG5603PBnx0Z9tHf//27lx0atx4/ZcDfdjWG9QuvXbCIT7a\nxMEhvm4hhFLk5xR4L6Z5t3g9tJqrPaP27wCSTU+QcVmrzui71OTlceyiISrWg78n\nXu5WlDL2EFnOKj/C4W7PgEzHip6GjTmnrPXujIMRgee0mplzrN6vqbsGYKIN3c9R\n9h7yvQTYNCP1CJEbqvIGQLLHHzmiX7UeTtg0sxRLWLil4r7aJXGEqUk+wWYLDHZO\nu+OsoJedAgMBAAECggEACFE6HNn+ecoRIHzuqyjC/I0a3xAIOFRYEnM3J+KjYkEg\nbZ1tSWgYleJ2GypuJRieCUAJElkIoc8Cqy/EB7oSeePRxFGkOLodScTl6HfQUNJT\nnbVBalZfOIuOa3DonSvCNrQnlVSEVujynxPLXoYjf+YmaWd0/AMZjCef4lcvxSVq\nwlTubIiDoaUNSua9cEACsgQxrhr8Cj5GxieL7GSqdc0825eSqnD5UsgdLsNEhpGu\nvFDJJu0wmPRRfel84snKlZgr3i+6kAqvNEL99/xQhSEQlK1L7HQFOC/73YyIz1NW\nEDkOAhzAsGyHdXTPqiyt7N9iCAAIKA+8vrzb5BZr6QKBgQDy1J2zrUyGKwIhfraP\n5WLeiLblnVF7yHOlYKaBflOzP4Ddl17p6yxo4rExHnn8Ycx3MlrwiJPlX/m2+qJ2\nCT/3HlbvBM31o5WiVnt/y0NdpHXO1ABNd7UCzxYTeZTSR6GccPdYa14so6e5DDtF\n9adRYUY2yIKe55sWwxNzLpDIpQKBgQDDV/6E6y/lNUBRyWhKp17Ru5LT0ryoGFNp\nV9M+RVlsBui2pJ+VdIg/nu3JaaEnTZIGApQjwDpQ+Fq0J5krl/dvPxugqMd/Hi44\nsQ6mSsKZhcx/v9EEgVol71VCS076slcdQy9nqqIiJBJjLXYIWewMd2ynLDRzuAAb\nmr9WSAlpmQKBgEmBLpN6+9UJI8X700tPhlQSUjrDGi08CjWfQgeks7VonZt1/JcW\nRwUgyb4ymX5aJEhYh8qTrSEboj1PNOpB9ojZODt12tpmQB85ynxujN/FrpuC9Ox+\nNd65zNbsUK4uXK88SsMLDSC6EUUkfLS6nYE2zsg6fb+YIAwN1M9i4xS5AoGAHnu1\n0SIuaDNGJT0r1DKIHmyJ/hotrIGXSqIU6evCh5QQbqgD6zuzI1J2wu6D4nE9b0ip\nu2Z88zO+W8yuH1pol2ietBSChTi9d8VRhuu1sGVrwye4w144JiFSCbVczsxTwdJB\nLIk5IeDFKcrnV2hI6K0ePHwudzxob+ZXI2y8Y0kCgYBW4/G4+ejuAwv2m3XJAFN2\nscrH/x/g+xWNu/KJtbyfiK0aovSPYFyjDsLNjD9Wb2LIhQ7bpdhjJqPxfYteGzyX\nMzY5bmlOmxKFtbDUv6oJDtnBudyWQj0gozQLJFMeP2KEuxmdQWo5h85qWhnIbveC\nKLZdy6Q4QQgDqjrQwO8Cyg==\n-----END PRIVATE KEY-----\n",
            client_email: "eta-ruby-document-ai@eta-ruby.iam.gserviceaccount.com",
            client_id: "109383270199243412864",
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
            client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/eta-ruby-document-ai%40eta-ruby.iam.gserviceaccount.com",
            universe_domain: "googleapis.com"
        }
    });

    const {record, old_record} = await req.json();
    const {id: entryId, notebook_id} = record;

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: {Authorization: req.headers.get('Authorization')!},
                },
            }
        )

        const {
            data: entryBlob,
            error: entryFileError
        } = await supabaseClient.storage.from("entries").download(`${notebook_id}/${entryId}.pdf`);
        if (entryFileError) {
            return new Response(JSON.stringify({error: entryFileError.message}), {status: 500})
        }
        const buffer = await entryBlob?.arrayBuffer();

        console.log("Buffer:", buffer)
        console.log(`New record inserted into entries:`, record)

        // Extract text
        const projectId = 'eta-ruby';
        const location = 'us'; // Format is 'us' or 'eu'
        const processorId = '5f462157b077ca2c'; // Create processor in Cloud Console
        const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

        const encodedFile = base64Encode(buffer)

        console.log("Encoded file:", encodedFile)

        const request = {
            name,
            rawDocument: {
                content: encodedFile,
                mimeType: 'application/pdf',
            },
        };

        const [result] = await documentOCRClient.processDocument(request);
        const {document} = result;

        console.log("Result:", result)
        console.log(`Document:`, document)

        const document_text = document.text ?? '';
        console.log(`Document text:`, document_text)

        return new Response(
            JSON.stringify(document_text),
            {headers: {...corsHeaders, "Content-Type": "application/json"}},
        )
    } catch (e) {
        console.log(`Error processing new entry:`, e)
        return new Response(JSON.stringify({error: e.message}), {status: 500})
    }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/handle-insert-entry' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
