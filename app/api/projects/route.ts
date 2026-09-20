import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/session";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "projects"; // "projects" | "developers"
    const query = searchParams.get("search") || "";
    const category = searchParams.get("category") || "All";
    const minTrust = parseFloat(searchParams.get("minTrust") || "0");
    const onlyVerified = searchParams.get("onlyVerified") === "true";

    const normalizedQuery = query.toLowerCase().trim();

    if (type === "projects") {
      // Build filters
      const where: any = {
        status: "OPEN",
      };

      if (normalizedQuery) {
        where.OR = [
          { title: { contains: normalizedQuery } },
          { description: { contains: normalizedQuery } },
          { skills: { contains: normalizedQuery } },
        ];
      }

      if (category && category !== "All") {
        where.category = category;
      }

      if (onlyVerified || minTrust > 0) {
        where.client = {};
        if (onlyVerified) {
          where.client.verificationBadge = true;
        }
        if (minTrust > 0) {
          where.client.trustScore = { gte: minTrust };
        }
      }

      const projects = await prisma.project.findMany({
        where,
        include: {
          client: {
            select: {
              name: true,
              verificationBadge: true,
              trustScore: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Format response to match front-end structure
      const formattedProjects = projects.map((p) => ({
        id: p.id,
        title: p.title,
        clientName: p.client.name,
        clientVerified: p.client.verificationBadge,
        category: p.category,
        budget: p.budget,
        deadline: p.deadline,
        skills: p.skills ? p.skills.split(",").map((s) => s.trim()) : [],
        description: p.description,
        trustScore: p.client.trustScore,
        createdAt: p.createdAt.toISOString(),
      }));

      return NextResponse.json(formattedProjects);
    } else {
      // Query Developers (DEVELOPER role)
      const where: any = {
        role: "DEVELOPER",
      };

      if (normalizedQuery) {
        where.OR = [
          { name: { contains: normalizedQuery } },
          { profile: { title: { contains: normalizedQuery } } },
          { profile: { skills: { contains: normalizedQuery } } },
        ];
      }

      if (onlyVerified) {
        where.verificationBadge = true;
      }

      if (minTrust > 0) {
        where.trustScore = { gte: minTrust };
      }

      const users = await prisma.user.findMany({
        where,
        include: {
          profile: true,
        },
        orderBy: {
          trustScore: "desc",
        },
      });

      // Format to match MOCK_DEVELOPERS
      const formattedDevelopers = users.map((u) => {
        const skillsArray = u.profile?.skills
          ? u.profile.skills.split(",").map((s) => s.trim())
          : [];
        let parsedAiSkills = {};
        try {
          parsedAiSkills = JSON.parse(u.profile?.aiSkillScore || "{}");
        } catch (_) {}

        return {
          id: u.id,
          name: u.name,
          avatar: u.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "DB",
          verifiedPro: u.verificationBadge,
          title: u.profile?.title || "Freelance Software Engineer",
          skills: skillsArray,
          hourlyRate: u.profile?.hourlyRate || 800,
          availability: u.profile?.availability || "Available Full-Time",
          location: u.profile?.location || "India",
          trustScore: u.trustScore,
          aiSkillScore: parsedAiSkills,
          completedProjects: 0,
          rating: 5.0,
          bio: u.profile?.bio || "Vetted software development specialist dedicated to client success.",
          github: u.profile?.github || "",
          linkedin: u.profile?.linkedin || "",
        };
      });

      return NextResponse.json(formattedDevelopers);
    }
  } catch (error: any) {
    console.error("Fetch projects error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, category, skills, budget, deadline } = await request.json();

    if (!title || !description || !category || !skills || !budget || !deadline) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert project
    const project = await prisma.project.create({
      data: {
        title,
        description,
        category,
        skills: Array.isArray(skills) ? skills.join(", ") : skills,
        budget: parseFloat(budget.toString()),
        deadline,
        status: "OPEN",
        clientId: userId,
      },
    });

    return NextResponse.json(project);
  } catch (error: any) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
