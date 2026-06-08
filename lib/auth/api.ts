import { NextResponse } from "next/server";
import { RESPONSE_CODES } from "./enums";

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json(
    { error: message },
    { status: RESPONSE_CODES.UNAUTHORIZED },
  );
}

export function badRequestResponse(message: string) {
  return NextResponse.json(
    { error: message },
    { status: RESPONSE_CODES.BAD_REQUEST },
  );
}

export function jsonResponse<T>(data: T, status = RESPONSE_CODES.OK) {
  return NextResponse.json(data, { status });
}
