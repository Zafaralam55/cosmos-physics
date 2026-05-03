/**
 * Standalone production server for Expo static builds.
 *
 * Routing logic:
 * - GET / or /manifest with expo-platform: ios|android → native manifest JSON (Expo Go OTA)
 * - GET any path from a browser (no expo-platform header):
 *     → serve Expo web build from static-build/web/ (SPA, index.html fallback)
 * - GET /{timestamp}/_expo/... → native static asset (bundle / assets)
 * - Everything else → static file from static-build/ root
 *
 * Zero external dependencies — uses only Node.js built-ins (http, fs, path).
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const STATIC_ROOT = path.resolve(__dirname, "..", "static-build");
const WEB_ROOT = path.resolve(__dirname, "..", "static-build", "web");
const TEMPLATE_PATH = path.resolve(__dirname, "templates", "landing-page.html");
const basePath = (process.env.BASE_PATH || "/").replace(/\/+$/, "");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".map": "application/json",
};

function getAppName() {
  try {
    const appJsonPath = path.resolve(__dirname, "..", "app.json");
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf-8"));
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}

function serveManifest(platform, res) {
  const manifestPath = path.join(STATIC_ROOT, platform, "manifest.json");

  if (!fs.existsSync(manifestPath)) {
    res.writeHead(404, { "content-type": "application/json" });
    res.end(
      JSON.stringify({ error: `Manifest not found for platform: ${platform}` }),
    );
    return;
  }

  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.writeHead(200, {
    "content-type": "application/json",
    "expo-protocol-version": "1",
    "expo-sfv-version": "0",
  });
  res.end(manifest);
}

function serveLandingPage(req, res, landingPageTemplate, appName) {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol = forwardedProto || "https";
  const host = req.headers["x-forwarded-host"] || req.headers["host"];
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;

  const html = landingPageTemplate
    .replace(/BASE_URL_PLACEHOLDER/g, baseUrl)
    .replace(/EXPS_URL_PLACEHOLDER/g, expsUrl)
    .replace(/APP_NAME_PLACEHOLDER/g, appName);

  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(html);
}

function serveFromDir(dir, pathname, res) {
  const safePath = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(dir, safePath);

  if (!filePath.startsWith(dir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return false;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    return false;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const content = fs.readFileSync(filePath);
  res.writeHead(200, { "content-type": contentType });
  res.end(content);
  return true;
}

function serveStaticFile(urlPath, res) {
  const served = serveFromDir(STATIC_ROOT, urlPath, res);
  if (!served) {
    res.writeHead(404);
    res.end("Not Found");
  }
}

/**
 * Serve the Expo web build for a browser request.
 * Implements SPA fallback: any path that isn't a static asset
 * gets index.html so client-side routing works.
 */
function serveWebApp(pathname, req, res, fallbackTemplate, appName) {
  const webIndex = path.join(WEB_ROOT, "index.html");
  const hasWebBuild = fs.existsSync(webIndex);

  if (!hasWebBuild) {
    return serveLandingPage(req, res, fallbackTemplate, appName);
  }

  // Try to serve an exact static file from the web build first
  if (pathname !== "/") {
    const served = serveFromDir(WEB_ROOT, pathname, res);
    if (served) return;
  }

  // SPA fallback — serve index.html for all unmatched paths
  const content = fs.readFileSync(webIndex);
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(content);
}

const landingPageTemplate = fs.readFileSync(TEMPLATE_PATH, "utf-8");
const appName = getAppName();

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  let pathname = url.pathname;

  if (basePath && pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length) || "/";
  }

  const platform = req.headers["expo-platform"];

  // Native Expo Go requests — serve manifests
  if ((pathname === "/" || pathname === "/manifest") && (platform === "ios" || platform === "android")) {
    return serveManifest(platform, res);
  }

  // All other requests — browser / web
  // Native asset files (bundles, timestamp-prefixed) go to static-build root
  // Web app files go to static-build/web
  if (platform === "ios" || platform === "android") {
    // Native static asset (bundle JS, images, etc.)
    return serveStaticFile(pathname, res);
  }

  // Browser request → serve Expo web build
  return serveWebApp(pathname, req, res, landingPageTemplate, appName);
});

const port = parseInt(process.env.PORT || "3000", 10);
server.listen(port, "0.0.0.0", () => {
  console.log(`Serving static Expo build on port ${port}`);
});
