import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

function getGlobalCommandsDir(): string {
  return path.join(os.homedir(), ".claude", "commands");
}

function getProjectCommandsDir(): string {
  return path.join(process.cwd(), ".claude", "commands");
}

function getInstalledSkillsDir(): string {
  return path.join(os.homedir(), ".agents", "skills");
}

function findSkillFile(
  name: string
): { filePath: string; source: "global" | "project" | "installed" } | null {
  // Check project first, then global, then installed (~/.agents/skills/)
  const projectPath = path.join(getProjectCommandsDir(), `${name}.md`);
  if (fs.existsSync(projectPath)) {
    return { filePath: projectPath, source: "project" };
  }
  const globalPath = path.join(getGlobalCommandsDir(), `${name}.md`);
  if (fs.existsSync(globalPath)) {
    return { filePath: globalPath, source: "global" };
  }
  // Installed skills: ~/.agents/skills/{name}/SKILL.md
  const installedPath = path.join(getInstalledSkillsDir(), name, "SKILL.md");
  if (fs.existsSync(installedPath)) {
    return { filePath: installedPath, source: "installed" };
  }
  return null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const found = findSkillFile(name);
    if (!found) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    const content = fs.readFileSync(found.filePath, "utf-8");
    const firstLine = content.split("\n")[0]?.trim() || "";
    const description = firstLine.startsWith("#")
      ? firstLine.replace(/^#+\s*/, "")
      : firstLine || `Skill: /${name}`;

    return NextResponse.json({
      skill: {
        name,
        description,
        content,
        source: found.source,
        filePath: found.filePath,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to read skill" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const body = await request.json();
    const { content } = body as { content: string };

    const found = findSkillFile(name);
    if (!found) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    fs.writeFileSync(found.filePath, content ?? "", "utf-8");

    const firstLine = (content ?? "").split("\n")[0]?.trim() || "";
    const description = firstLine.startsWith("#")
      ? firstLine.replace(/^#+\s*/, "")
      : firstLine || `Skill: /${name}`;

    return NextResponse.json({
      skill: {
        name,
        description,
        content: content ?? "",
        source: found.source,
        filePath: found.filePath,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update skill" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const found = findSkillFile(name);
    if (!found) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    fs.unlinkSync(found.filePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete skill" },
      { status: 500 }
    );
  }
}
