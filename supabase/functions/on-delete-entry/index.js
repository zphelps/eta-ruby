"use strict";
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
var cors_ts_1 = require("../_shared/cors.ts");
var pdf_lib__1_11_1_dts_1 = require("https://cdn.skypack.dev/pdf-lib@^1.11.1?dts");
var supabase_js_2_1 = require("jsr:@supabase/supabase-js@2");
Deno.serve(function (req) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, record, old_record, entryId, notebook_id, supabase, _b, previewData, previewDownloadError, buffer, existingPreviewPDF, _c, entryData, entryError, entryToRemove, previewDeleteError, _d, data, error, start_index, _i, data_1, entry, end_index, indices_to_remove_1, i, newPreviewPDF_1, indicesToCopy, copiedPages, pdfBytes, previewUploadError, error_1;
    var _e, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                // This is needed if you're planning to invoke your function from a browser.
                if (req.method === 'OPTIONS') {
                    return [2 /*return*/, new Response('ok', { headers: cors_ts_1.corsHeaders })];
                }
                _g.label = 1;
            case 1:
                _g.trys.push([1, 18, , 19]);
                return [4 /*yield*/, req.json()];
            case 2:
                _a = _g.sent(), record = _a.record, old_record = _a.old_record;
                entryId = old_record.id, notebook_id = old_record.notebook_id;
                console.log("OLD RECORD:", record, "NEW RECORD:", old_record);
                console.log("ENTRY ID:", entryId, "NOTEBOOK_ID", notebook_id);
                supabase = (0, supabase_js_2_1.createClient)((_e = Deno.env.get('SUPABASE_URL')) !== null && _e !== void 0 ? _e : '', (_f = Deno.env.get('SUPABASE_ANON_KEY')) !== null && _f !== void 0 ? _f : '', {
                    global: {
                        headers: { Authorization: req.headers.get('Authorization') },
                    },
                });
                return [4 /*yield*/, supabase
                        .storage
                        .from("notebooks")
                        .download("".concat(notebook_id, "/preview.pdf?buster=").concat(new Date().getTime()))];
            case 3:
                _b = _g.sent(), previewData = _b.data, previewDownloadError = _b.error;
                if (previewDownloadError) {
                    console.error(previewDownloadError);
                    throw new Error(previewDownloadError.message);
                }
                return [4 /*yield*/, (previewData === null || previewData === void 0 ? void 0 : previewData.arrayBuffer())];
            case 4:
                buffer = _g.sent();
                return [4 /*yield*/, pdf_lib__1_11_1_dts_1.PDFDocument.load(buffer)];
            case 5:
                existingPreviewPDF = _g.sent();
                return [4 /*yield*/, supabase.from("entries").select("*").eq("id", entryId)];
            case 6:
                _c = _g.sent(), entryData = _c.data, entryError = _c.error;
                if (entryError) {
                    throw new Error(entryError.message);
                }
                entryToRemove = entryData[0];
                return [4 /*yield*/, supabase.storage.from("entries").remove(["".concat(notebook_id, "/").concat(entryId, ".pdf")])];
            case 7:
                previewDeleteError = (_g.sent()).error;
                if (previewDeleteError) {
                    throw new Error(previewDeleteError.message);
                }
                return [4 /*yield*/, supabase
                        .from("entries")
                        .select("*")
                        .eq("notebook_id", entryToRemove.notebook_id)
                        .lte("created_at", entryToRemove.created_at)
                        .order("created_at", { ascending: true })];
            case 8:
                _d = _g.sent(), data = _d.data, error = _d.error;
                if (error) {
                    throw new Error(error.message);
                }
                start_index = 0;
                for (_i = 0, data_1 = data; _i < data_1.length; _i++) {
                    entry = data_1[_i];
                    start_index += entry.page_count;
                }
                end_index = start_index + entryToRemove.page_count;
                indices_to_remove_1 = [];
                for (i = start_index; i < end_index; i++) {
                    indices.push(i);
                }
                return [4 /*yield*/, pdf_lib__1_11_1_dts_1.PDFDocument.create()];
            case 9:
                newPreviewPDF_1 = _g.sent();
                indicesToCopy = existingPreviewPDF.getPageIndices().filter(function (index) { return !indices_to_remove_1.includes(index); });
                if (!(indicesToCopy.length === 0)) return [3 /*break*/, 10];
                newPreviewPDF_1 = null;
                return [3 /*break*/, 12];
            case 10: return [4 /*yield*/, newPreviewPDF_1.copyPages(existingPreviewPDF, existingPreviewPDF.getPageIndices().filter(function (index) { return !indices_to_remove_1.includes(index); }))];
            case 11:
                copiedPages = _g.sent();
                copiedPages.forEach(function (page) { return newPreviewPDF_1.addPage(page); });
                _g.label = 12;
            case 12:
                if (!(newPreviewPDF_1 === null)) return [3 /*break*/, 14];
                return [4 /*yield*/, supabase.storage.from("notebooks").remove(["".concat(notebook_id, "/preview.pdf")])];
            case 13:
                _g.sent();
                return [3 /*break*/, 17];
            case 14: return [4 /*yield*/, newPreviewPDF_1.save()];
            case 15:
                pdfBytes = _g.sent();
                return [4 /*yield*/, supabase.storage.from("notebooks").upload("".concat(notebook_id, "/preview.pdf"), pdfBytes, { contentType: 'application/pdf', upsert: true })];
            case 16:
                previewUploadError = (_g.sent()).error;
                if (previewUploadError) {
                    throw new Error(previewUploadError.message);
                }
                _g.label = 17;
            case 17: return [2 /*return*/, new Response(JSON.stringify(data), {
                    headers: __assign(__assign({}, cors_ts_1.corsHeaders), { 'Content-Type': 'application/json' }),
                    status: 200,
                })];
            case 18:
                error_1 = _g.sent();
                console.error(error_1);
                return [2 /*return*/, new Response(JSON.stringify({ error: error_1.message }), {
                        headers: __assign(__assign({}, cors_ts_1.corsHeaders), { 'Content-Type': 'application/json' }),
                        status: 400,
                    })];
            case 19: return [2 /*return*/];
        }
    });
}); });
/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/on-delete-entry' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
