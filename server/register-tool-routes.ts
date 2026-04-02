import type { IncomingMessage, ServerResponse } from "node:http";
import { handlePdfToImageRequest } from "./pdf-to-image";
import {
  handleExcelToPdfRequest,
  handlePdfCompressRequest,
  handlePdfMergeRequest,
  handlePdfSplitRequest,
  handlePdfToWordRequest,
  handlePdfWatermarkRequest,
  handlePptToPdfRequest,
  handleWordToPdfRequest,
  handleZipCreateRequest,
  handleZipExtractRequest,
} from "./tool-routes";

export type ConvertRequestHandler = (
  req: IncomingMessage,
  res: ServerResponse
) => Promise<void>;

export type RegisterPostRoute = (
  route: string,
  handler: ConvertRequestHandler
) => void;

export function registerConvertRoutes(registerPost: RegisterPostRoute) {
  registerPost("/api/convert/pdf-to-image", handlePdfToImageRequest);
  registerPost("/api/convert/pdf-compress", handlePdfCompressRequest);
  registerPost("/api/convert/pdf-merge", handlePdfMergeRequest);
  registerPost("/api/convert/pdf-split", handlePdfSplitRequest);
  registerPost("/api/convert/pdf-watermark", handlePdfWatermarkRequest);
  registerPost("/api/convert/word-to-pdf", handleWordToPdfRequest);
  registerPost("/api/convert/excel-to-pdf", handleExcelToPdfRequest);
  registerPost("/api/convert/ppt-to-pdf", handlePptToPdfRequest);
  registerPost("/api/convert/pdf-to-word", handlePdfToWordRequest);
  registerPost("/api/convert/zip-create", handleZipCreateRequest);
  registerPost("/api/convert/zip-extract", handleZipExtractRequest);
}
