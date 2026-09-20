import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/session";

export async function PUT(request: Request) {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      name,
      title,
      bio,
      skills,
      hourlyRate,
      availability,
      location,
      languages,
      github,
      linkedin,
      portfolio,
      experience,
      education,
      certifications,
    } = await request.json();

    // Verify user exists and is a developer/agency
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "DEVELOPER") {
      return NextResponse.json({ error: "Unauthorized role" }, { status: 403 });
    }

    // Update User.fullName and User.name
    if (name) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: name.trim(),
          fullName: name.trim(),
        },
      });
    }

    // Update Profile
    const profileData = {
      title: title !== undefined ? title : undefined,
      bio: bio !== undefined ? bio : undefined,
      skills: Array.isArray(skills) ? skills.join(", ") : (skills !== undefined ? skills : undefined),
      hourlyRate: hourlyRate !== undefined ? Number(hourlyRate) : undefined,
      availability: availability !== undefined ? availability : undefined,
      location: location !== undefined ? location : undefined,
      languages: languages !== undefined ? languages : undefined,
      github: github !== undefined ? github : undefined,
      linkedin: linkedin !== undefined ? linkedin : undefined,
      portfolio: portfolio !== undefined ? (typeof portfolio === "string" ? portfolio : JSON.stringify(portfolio)) : undefined,
      experience: experience !== undefined ? (typeof experience === "string" ? experience : JSON.stringify(experience)) : undefined,
      education: education !== undefined ? (typeof education === "string" ? education : JSON.stringify(education)) : undefined,
      certifications: certifications !== undefined ? (typeof certifications === "string" ? certifications : JSON.stringify(certifications)) : undefined,
    };

    const updatedProfile = await prisma.profile.upsert({
      where: { userId },
      update: profileData,
      create: {
        userId,
        ...profileData,
        skills: profileData.skills || "React, Node.js",
      },
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error("Update developer profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
