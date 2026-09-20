import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const supportReq = await prisma.supportRequest.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        subject: subject.trim(),
        message: message.trim(),
      },
    });

    return NextResponse.json({ success: true, data: supportReq });
  } catch (error) {
    console.error("Support request error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
