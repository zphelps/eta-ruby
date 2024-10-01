"use strict";
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// Setup type definitions for built-in Supabase Runtime APIs
require("jsr:@supabase/functions-js/edge-runtime.d.ts");
var supabase_js_2_1 = require("jsr:@supabase/supabase-js@2");
var npm_openai_1 = require("npm:openai");
var cors_ts_1 = require("../_shared/cors.ts");
Deno.serve(function (req) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, query, tag, notebook_id, supabase, openai, embeddingResponse, embedding, documents, error_1;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                // This is needed if you're planning to invoke your function from a browser.
                if (req.method === 'OPTIONS') {
                    return [2 /*return*/, new Response('ok', { headers: cors_ts_1.corsHeaders })];
                }
                _d.label = 1;
            case 1:
                _d.trys.push([1, 5, , 6]);
                return [4 /*yield*/, req.json()];
            case 2:
                _a = _d.sent(), query = _a.query, tag = _a.tag, notebook_id = _a.notebook_id;
                console.log('QUERY:', query, 'TAG:', tag);
                supabase = (0, supabase_js_2_1.createClient)((_b = Deno.env.get('SUPABASE_URL')) !== null && _b !== void 0 ? _b : '', (_c = Deno.env.get('SUPABASE_ANON_KEY')) !== null && _c !== void 0 ? _c : '', {
                    global: {
                        headers: { Authorization: req.headers.get('Authorization') },
                    },
                });
                openai = new npm_openai_1.default({ apiKey: Deno.env.get('OPENAI_API_KEY') });
                return [4 /*yield*/, openai.embeddings.create({
                        model: 'text-embedding-3-small',
                        input: query,
                        dimensions: 1536,
                    })];
            case 3:
                embeddingResponse = _d.sent();
                embedding = embeddingResponse.data[0].embedding;
                console.log("NOTEBOOK_ID", notebook_id);
                return [4 /*yield*/, supabase.rpc('match_entries', {
                        query_text: query,
                        query_embedding: embedding,
                        match_count: 10,
                        notebook_id_filter: notebook_id,
                    })];
            case 4:
                documents = (_d.sent()).data;
                console.log('DOCUMENTS:', documents);
                return [2 /*return*/, new Response(JSON.stringify(documents), {
                        headers: __assign(__assign({}, cors_ts_1.corsHeaders), { 'Content-Type': 'application/json' }),
                        status: 200,
                    })];
            case 5:
                error_1 = _d.sent();
                console.log(error_1);
                return [2 /*return*/, new Response(error_1.message, { status: 500 })];
            case 6: return [2 /*return*/];
        }
    });
}); });
/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/search-entries' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
