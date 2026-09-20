import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/session";
import { signToken } from "@/lib/jwt";

// Basic URL validation
const isValidUrl = (url: string, requiredDomain?: string) => {
  if (!url) return true; // Optional fields can be empty
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    if (requiredDomain && !parsed.hostname.includes(requiredDomain)) return false;
    return true;
  } catch (e) {
    return false;
  }
};

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const data = await request.json();

    const updateData: any = {};
    const profileData: any = {};

    // Validate links
    if (data.linkedin && !isValidUrl(data.linkedin, "linkedin.com")) {
      return NextResponse.json({ error: "Invalid LinkedIn URL. Must be HTTPS and from linkedin.com" }, { status: 400 });
    }
    if (data.github && !isValidUrl(data.github, "github.com")) {
      return NextResponse.json({ error: "Invalid GitHub URL. Must be HTTPS and from github.com" }, { status: 400 });
    }
    if (data.portfolio && !isValidUrl(data.portfolio)) {
      return NextResponse.json({ error: "Invalid Portfolio URL. Must be HTTPS." }, { status: 400 });
    }
    if (data.companyWebsite && !isValidUrl(data.companyWebsite)) {
      return NextResponse.json({ error: "Invalid Company Website URL. Must be HTTPS." }, { status: 400 });
    }

    if (user.role === "DEVELOPER") {
      if (!data.name || !data.title || !data.skills || !data.experience || !data.bio || !data.location || !data.phone || !data.linkedin || !data.github || !data.resumeUrl) {
        return NextResponse.json({ error: "All required fields must be filled out for Developers, including Resume, LinkedIn, and GitHub." }, { status: 400 });
      }

      updateData.name = data.name;
      updateData.fullName = data.name;
      profileData.title = data.title;
      profileData.skills = data.skills;
      profileData.experience = data.experience;
      profileData.bio = data.bio;
      profileData.location = data.location;
      profileData.phone = data.phone;
      profileData.linkedin = data.linkedin;
      profileData.github = data.github;
      profileData.portfolio = data.portfolio || "";
      profileData.resumeUrl = data.resumeUrl;
      profileData.avatar = data.avatar || "";
    } else {
      if (!data.name || !data.companyName || !data.companyDescription || !data.industry || !data.location || !data.phone || !data.companyWebsite || !data.linkedin) {
        return NextResponse.json({ error: "All required fields must be filled out for Clients, including Company Website and LinkedIn." }, { status: 400 });
      }

      updateData.name = data.name;
      updateData.fullName = data.name;
      profileData.companyName = data.companyName;
      profileData.companyDescription = data.companyDescription;
      profileData.industry = data.industry;
      profileData.location = data.location;
      profileData.phone = data.phone;
      profileData.companyWebsite = data.companyWebsite;
      profileData.linkedin = data.linkedin;
      profileData.github = data.github || "";
      profileData.avatar = data.avatar || "";
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { ...updateData, profileCompleted: true },
      }),
      prisma.profile.update({
        where: { userId: userId },
        data: profileData,
      }),
    ]);

    // Sign new token
    const token = signToken({ userId: user.id, role: user.role, profileCompleted: true });
    const isProd = process.env.NODE_ENV === "production";
    
    const response = NextResponse.json({ success: true, role: user.role });
    response.cookies.set("userId", token, { path: "/", maxAge: 60 * 60 * 24, httpOnly: false, secure: isProd, sameSite: "lax" });
    response.cookies.set("devbridge_session", token, { path: "/", maxAge: 60 * 60 * 24, httpOnly: true, secure: isProd, sameSite: "lax" });

    return response;
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
