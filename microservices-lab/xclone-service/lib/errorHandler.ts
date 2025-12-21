import { NextResponse } from "next/server";

export const handleApiError = (error: unknown, message = "Internal Error", status = 500) => {
  console.log(error);
  return new NextResponse(message, { status });
};
