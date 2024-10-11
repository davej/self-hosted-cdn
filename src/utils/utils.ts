import type { ParsedRange } from '../types';

export function rangeHasLength(
  object: ParsedRange
): object is { offset: number; length: number } {
  return (<{ offset: number; length: number }>object).length !== undefined;
}

export function hasBody(
  object: R2Object | R2ObjectBody
): object is R2ObjectBody {
  return (<R2ObjectBody>object).body !== undefined;
}

export function hasSuffix(range: ParsedRange): range is { suffix: number } {
  return (<{ suffix: number }>range).suffix !== undefined;
}

export function getRangeHeader(range: ParsedRange, fileSize: number): string {
  return `bytes ${hasSuffix(range) ? fileSize - range.suffix : range.offset}-${
    hasSuffix(range) ? fileSize - 1 : range.offset + range.length - 1
  }/${fileSize}`;
}
