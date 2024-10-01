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
var cors_ts_1 = require("../_shared/cors.ts");
var supabase_js_2_1 = require("jsr:@supabase/supabase-js@2");
var openai_4_1 = require("https://esm.sh/openai@4");
Deno.serve(function (req) { return __awaiter(void 0, void 0, void 0, function () {
    var record, entryId, notebook_id, queue, text, supabase, openai, result, embedding, updateEntryError, error_1;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                // This is needed if you're planning to invoke your function from a browser.
                if (req.method === 'OPTIONS') {
                    return [2 /*return*/, new Response('ok', { headers: cors_ts_1.corsHeaders })];
                }
                _d.label = 1;
            case 1:
                _d.trys.push([1, 6, , 7]);
                return [4 /*yield*/, req.json()];
            case 2:
                record = (_d.sent()).record;
                entryId = record.id, notebook_id = record.notebook_id, queue = record.queue, text = record.text;
                console.log("FUNCTION FOR ENTRY ID:", entryId);
                console.log("ENTRY ID:", entryId, "NOTEBOOK_ID", notebook_id, "QUEUE", queue);
                supabase = (0, supabase_js_2_1.createClient)((_a = Deno.env.get('SUPABASE_URL')) !== null && _a !== void 0 ? _a : '', (_b = Deno.env.get('SUPABASE_ANON_KEY')) !== null && _b !== void 0 ? _b : '', {
                    global: {
                        headers: { Authorization: req.headers.get('Authorization') },
                    },
                });
                if (!text) return [3 /*break*/, 5];
                openai = new openai_4_1.default({
                    apiKey: (_c = Deno.env.get('OPENAI_API_KEY')) !== null && _c !== void 0 ? _c : '',
                });
                return [4 /*yield*/, openai.embeddings.create({
                        input: text,
                        model: "text-embedding-3-small",
                    })];
            case 3:
                result = _d.sent();
                embedding = result.data[0].embedding;
                return [4 /*yield*/, supabase
                        .from('entries')
                        .update({ embedding: embedding })
                        .eq('id', entryId)];
            case 4:
                updateEntryError = (_d.sent()).error;
                if (updateEntryError) {
                    console.error(updateEntryError);
                    throw new Error(updateEntryError.message);
                }
                _d.label = 5;
            case 5: 
            // // update the entry queue value to be null
            // const {error: updateEntryError} = await supabase
            //     .from('entries')
            //     .update({ queue: null })
            //     .eq('id', entryId);
            //
            // if (updateEntryError) {
            //     console.error(updateEntryError);
            //     throw new Error(updateEntryError.message);
            // }
            //
            // console.log("ENTRY ID:", entryId, "UPDATED");
            return [2 /*return*/, new Response(JSON.stringify({ success: "true" }), {
                    headers: __assign(__assign({}, cors_ts_1.corsHeaders), { 'Content-Type': 'application/json' }),
                    status: 200,
                })];
            case 6:
                error_1 = _d.sent();
                console.error(error_1);
                return [2 /*return*/, new Response(JSON.stringify({ error: error_1.message }), {
                        headers: __assign(__assign({}, cors_ts_1.corsHeaders), { 'Content-Type': 'application/json' }),
                        status: 400,
                    })];
            case 7: return [2 /*return*/];
        }
    });
}); });
