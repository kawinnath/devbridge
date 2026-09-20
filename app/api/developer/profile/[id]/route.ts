import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/session";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing developer ID" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        reviewsReceived: {
          include: {
            reviewer: {
              select: {
                name: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!user || user.role !== "DEVELOPER") {
      return NextResponse.json({ error: "Developer not found" }, { status: 404 });
    }

    // Auto-create profile if missing
    let profile = user.profile;
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId: user.id,
          title: "Freelance Software Engineer",
          skills: "React, Node.js, JavaScript",
          availability: "Available Full-Time",
          location: "India",
          hourlyRate: 800,
          experience: "[]",
          education: "[]",
          certifications: "[]",
          portfolio: "[]",
        },
      });
    }

    // Calculate rating and completed projects
    const totalReviews = user.reviewsReceived.length;
    const avgRating = totalReviews > 0
      ? Number((user.reviewsReceived.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1))
      : 5.0;

    const completedProjectsCount = totalReviews;

    let parsedSocialLinks = {};
    try {
      parsedSocialLinks = JSON.parse(profile.socialLinks || "{}");
    } catch (_) {}

    // Format response
    const formattedProfile = {
      id: user.id,
      name: user.fullName || user.name,
      username: user.email.split("@")[0],
      email: user.email,
      role: user.role,
      joinedDate: user.createdAt.toISOString(),
      trustScore: user.trustScore,
      verifiedPro: user.verificationBadge,
      title: profile.title || "Freelance Software Engineer",
      bio: profile.bio || "Vetted software development specialist dedicated to client success.",
      skills: profile.skills ? profile.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
      hourlyRate: profile.hourlyRate || 800,
      availability: profile.availability || "Available Full-Time",
      location: profile.location || "India",
      languages: profile.languages || "English (Fluent)",
      github: profile.github || "",
      linkedin: profile.linkedin || "",
      socialLinks: parsedSocialLinks,
      resumeUrl: profile.resumeUrl || null,
      resumeFileName: profile.resumeFileName || null,
      avatar: profile.avatar || user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "DB",
      banner: profile.banner || "",
      experience: JSON.parse(profile.experience || "[]"),
      education: JSON.parse(profile.education || "[]"),
      certifications: JSON.parse(profile.certifications || "[]"),
      portfolio: JSON.parse(profile.portfolio || "[]"),
      aiSkillScore: JSON.parse(profile.aiSkillScore || "{}"),
      subscription: profile.subscription || "BASIC",
      rating: avgRating,
      completedProjects: completedProjectsCount,
      reviews: user.reviewsReceived.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        reviewerName: r.reviewer.fullName || r.reviewer.name,
      })),
    };

    return NextResponse.json(formattedProfile);
  } catch (error: any) {
    console.error("Developer profile error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionUserId = await getUserIdFromSession();

    if (!sessionUserId || sessionUserId !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { socialLinks, resumeUrl, resumeFileName } = body;

    const updateData: any = {};
    if (socialLinks !== undefined) {
      updateData.socialLinks = typeof socialLinks === "string" ? socialLinks : JSON.stringify(socialLinks);
    }
    if (resumeUrl !== undefined) {
      updateData.resumeUrl = resumeUrl;
    }
    if (resumeFileName !== undefined) {
      updateData.resumeFileName = resumeFileName;
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId: id },
      data: updateData,
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error: any) {
    console.error("Update profile links error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
