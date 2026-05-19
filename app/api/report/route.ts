import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      appVersion,
      androidVersion,
      deviceModel,
      errorMessage,
      stackTrace,
      diagnosticPath,
    } = body;
    if (!appVersion || !errorMessage) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400, headers: corsHeaders },
      );
    }

    const bodyStr = JSON.stringify(body);
    if (bodyStr.length > 50000) {
      return NextResponse.json(
        { error: "Report too large" },
        { status: 413, headers: corsHeaders },
      );
    }

    const issueBody = `## Auto-submitted bug report

**App version:** ${appVersion}
**Android version:** ${androidVersion || "unknown"}
**Device:** ${deviceModel || "unknown"}

### Error
\`\`\`
${errorMessage}
\`\`\`

### Stack trace
\`\`\`
${stackTrace || "not available"}
\`\`\`

### Startup diagnostic path
\`\`\`
${diagnosticPath || "not available"}
\`\`\`

### Additional context
${body.additionalContext || "none"}

---
*This report was submitted automatically from the Khord app with user consent.*`;

    const ghResponse = await fetch(
      "https://api.github.com/repos/Khord-Project/khord/issues",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_BOT_TOKEN}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `[Auto Report] ${errorMessage.substring(0, 100)}`,
          body: issueBody,
          labels: ["bug", "auto-report"],
        }),
      },
    );

    if (!ghResponse.ok) {
      const err = await ghResponse.text();
      console.error("GitHub API error:", err);
      return NextResponse.json(
        { error: "Failed to create issue" },
        { status: 502, headers: corsHeaders },
      );
    }

    const issue = await ghResponse.json();
    return NextResponse.json(
      { success: true, issueUrl: issue.html_url },
      { status: 201, headers: corsHeaders },
    );
  } catch (e) {
    console.error("Report endpoint error:", e);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500, headers: corsHeaders },
    );
  }
}
