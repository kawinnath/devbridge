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
      return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
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

    if (!user || user.role !== "CLIENT") {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    let profile = user.profile;
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId: user.id,
          companyName: user.name,
          location: "India",
          skills: "", // Add required field
        },
      });
    }

    let parsedSocialLinks = {};
    try {
      parsedSocialLinks = JSON.parse(profile.socialLinks || "{}");
    } catch (_) {}

    const formattedProfile = {
      id: user.id,
      name: user.fullName || user.name,
      companyName: profile.companyName || user.name,
      companyDescription: profile.companyDescription || "",
      industry: profile.industry || "",
      location: profile.location || "",
      phone: profile.phone || "",
      companyWebsite: profile.companyWebsite || "",
      github: profile.github || "",
      linkedin: profile.linkedin || "",
      socialLinks: parsedSocialLinks,
      avatar: profile.avatar || user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "DB",
      joinedDate: user.createdAt.toISOString(),
      trustScore: user.trustScore,
      verifiedPro: user.verificationBadge,
      role: user.role,
    };

    return NextResponse.json(formattedProfile);
  } catch (error: any) {
    console.error("Client profile error:", error);
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
    const { socialLinks, companyName, companyDescription, industry, location, phone, companyWebsite } = body;

    const updateData: any = {};
    if (socialLinks !== undefined) {
      updateData.socialLinks = typeof socialLinks === "string" ? socialLinks : JSON.stringify(socialLinks);
    }
    if (companyName !== undefined) updateData.companyName = companyName;
    if (companyDescription !== undefined) updateData.companyDescription = companyDescription;
    if (industry !== undefined) updateData.industry = industry;
    if (location !== undefined) updateData.location = location;
    if (phone !== undefined) updateData.phone = phone;
    if (companyWebsite !== undefined) updateData.companyWebsite = companyWebsite;

    const updatedProfile = await prisma.profile.update({
      where: { userId: id },
      data: updateData,
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error: any) {
    console.error("Update client profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
