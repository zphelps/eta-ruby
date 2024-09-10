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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
// Setup type definitions for built-in Supabase Runtime APIs
require("jsr:@supabase/functions-js/edge-runtime.d.ts");
var cors_ts_1 = require("../_shared/cors.ts");
var supabase_js_2_1 = require("jsr:@supabase/supabase-js@2");
var pdf_lib__1_11_1_dts_1 = require("https://cdn.skypack.dev/pdf-lib@^1.11.1?dts");
Deno.serve(function (req) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, record, old_record, entryId, notebook_id_1, queue_1, supabase_1, isCurrentQueueSmallest_1, waitForQueue, _b, newEntryData, newEntryDownloadError, buffer, newEntryDoc, _c, data, error, preview_exists, existingPreviewDoc, _d, previewData, previewDownloadError, buffer_1, mergedPDF_1, _i, _e, pdf, copiedPages, pdfBytes, previewUploadError, updateEntryError, error_1;
    var _f, _g;
    return __generator(this, function (_h) {
        switch (_h.label) {
            case 0:
                // This is needed if you're planning to invoke your function from a browser.
                if (req.method === 'OPTIONS') {
                    return [2 /*return*/, new Response('ok', { headers: cors_ts_1.corsHeaders })];
                }
                _h.label = 1;
            case 1:
                _h.trys.push([1, 22, , 23]);
                return [4 /*yield*/, req.json()];
            case 2:
                _a = _h.sent(), record = _a.record, old_record = _a.old_record;
                entryId = record.id, notebook_id_1 = record.notebook_id, queue_1 = record.queue;
                console.log("OLD RECORD:", record, "NEW RECORD:", old_record);
                console.log("ENTRY ID:", entryId, "NOTEBOOK_ID", notebook_id_1);
                supabase_1 = (0, supabase_js_2_1.createClient)((_f = Deno.env.get('SUPABASE_URL')) !== null && _f !== void 0 ? _f : '', (_g = Deno.env.get('SUPABASE_ANON_KEY')) !== null && _g !== void 0 ? _g : '', {
                    global: {
                        headers: { Authorization: req.headers.get('Authorization') },
                    },
                });
                isCurrentQueueSmallest_1 = function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, data, error;
                    var _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0: return [4 /*yield*/, supabase_1
                                    .from('entries')
                                    .select('queue')
                                    .eq('notebook_id', notebook_id_1)
                                    .order('queue', { ascending: true })
                                    .limit(1)];
                            case 1:
                                _a = _c.sent(), data = _a.data, error = _a.error;
                                if (error) {
                                    throw new Error(error.message);
                                }
                                // Check if the smallest queue value is equal to the current entry's queue
                                return [2 /*return*/, ((_b = data === null || data === void 0 ? void 0 : data[0]) === null || _b === void 0 ? void 0 : _b.queue) === queue_1];
                        }
                    });
                }); };
                waitForQueue = function () {
                    var args_1 = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args_1[_i] = arguments[_i];
                    }
                    return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (interval, maxAttempts) {
                        var attempts, isSmallest;
                        if (interval === void 0) { interval = 1000; }
                        if (maxAttempts === void 0) { maxAttempts = 100; }
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    attempts = 0;
                                    _a.label = 1;
                                case 1:
                                    if (!(attempts < maxAttempts)) return [3 /*break*/, 4];
                                    return [4 /*yield*/, isCurrentQueueSmallest_1()];
                                case 2:
                                    isSmallest = _a.sent();
                                    if (isSmallest) {
                                        return [2 /*return*/, true];
                                    }
                                    attempts++;
                                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, interval); })];
                                case 3:
                                    _a.sent(); // Wait for the specified interval
                                    return [3 /*break*/, 1];
                                case 4: throw new Error('Max attempts reached, queue value did not become the smallest');
                            }
                        });
                    });
                };
                // Wait until the current entry's queue value is the smallest
                return [4 /*yield*/, waitForQueue()];
            case 3:
                // Wait until the current entry's queue value is the smallest
                _h.sent();
                return [4 /*yield*/, supabase_1
                        .storage
                        .from("entries")
                        .download("".concat(notebook_id_1, "/").concat(entryId, ".pdf?buster=").concat(new Date().getTime()))];
            case 4:
                _b = _h.sent(), newEntryData = _b.data, newEntryDownloadError = _b.error;
                if (newEntryDownloadError) {
                    console.error("ERROR GETTING ENTRY FILE", newEntryDownloadError);
                    throw new Error(newEntryDownloadError.message);
                }
                return [4 /*yield*/, (newEntryData === null || newEntryData === void 0 ? void 0 : newEntryData.arrayBuffer())];
            case 5:
                buffer = _h.sent();
                return [4 /*yield*/, pdf_lib__1_11_1_dts_1.PDFDocument.load(buffer)];
            case 6:
                newEntryDoc = _h.sent();
                return [4 /*yield*/, supabase_1
                        .storage
                        .from("notebooks")
                        .list(notebook_id_1, { search: "preview" })];
            case 7:
                _c = _h.sent(), data = _c.data, error = _c.error;
                preview_exists = data ? data.length > 0 : false;
                existingPreviewDoc = void 0;
                if (!preview_exists) return [3 /*break*/, 11];
                return [4 /*yield*/, supabase_1
                        .storage
                        .from("notebooks")
                        .download("".concat(notebook_id_1, "/preview.pdf?buster=").concat(new Date().getTime()))];
            case 8:
                _d = _h.sent(), previewData = _d.data, previewDownloadError = _d.error;
                if (previewDownloadError) {
                    console.error(previewDownloadError);
                    throw new Error(previewDownloadError.message);
                }
                return [4 /*yield*/, (previewData === null || previewData === void 0 ? void 0 : previewData.arrayBuffer())];
            case 9:
                buffer_1 = _h.sent();
                return [4 /*yield*/, pdf_lib__1_11_1_dts_1.PDFDocument.load(buffer_1)];
            case 10:
                existingPreviewDoc = _h.sent();
                return [3 /*break*/, 13];
            case 11: return [4 /*yield*/, pdf_lib__1_11_1_dts_1.PDFDocument.create()];
            case 12:
                existingPreviewDoc = _h.sent();
                _h.label = 13;
            case 13: return [4 /*yield*/, pdf_lib__1_11_1_dts_1.PDFDocument.create()];
            case 14:
                mergedPDF_1 = _h.sent();
                _i = 0, _e = [existingPreviewDoc, newEntryDoc];
                _h.label = 15;
            case 15:
                if (!(_i < _e.length)) return [3 /*break*/, 18];
                pdf = _e[_i];
                return [4 /*yield*/, mergedPDF_1.copyPages(pdf, pdf.getPageIndices())];
            case 16:
                copiedPages = _h.sent();
                copiedPages.forEach(function (page) { return mergedPDF_1.addPage(page); });
                _h.label = 17;
            case 17:
                _i++;
                return [3 /*break*/, 15];
            case 18: return [4 /*yield*/, mergedPDF_1.save()];
            case 19:
                pdfBytes = _h.sent();
                return [4 /*yield*/, supabase_1.storage.from("notebooks").upload("".concat(notebook_id_1, "/preview.pdf"), pdfBytes, { contentType: 'application/pdf', upsert: true })];
            case 20:
                previewUploadError = (_h.sent()).error;
                if (previewUploadError) {
                    console.error(previewUploadError);
                    throw new Error(previewUploadError.message);
                }
                return [4 /*yield*/, supabase_1
                        .from('entries')
                        .update({ queue: null })
                        .eq('id', entryId)];
            case 21:
                updateEntryError = (_h.sent()).error;
                if (updateEntryError) {
                    console.error(updateEntryError);
                    throw new Error(updateEntryError.message);
                }
                return [2 /*return*/, new Response(JSON.stringify(data), {
                        headers: __assign(__assign({}, cors_ts_1.corsHeaders), { 'Content-Type': 'application/json' }),
                        status: 200,
                    })];
            case 22:
                error_1 = _h.sent();
                console.error(error_1);
                return [2 /*return*/, new Response(JSON.stringify({ error: error_1.message }), {
                        headers: __assign(__assign({}, cors_ts_1.corsHeaders), { 'Content-Type': 'application/json' }),
                        status: 400,
                    })];
            case 23: return [2 /*return*/];
        }
    });
}); });
