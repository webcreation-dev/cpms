import { readFile } from "node:fs/promises";
import path from "node:path";

const formats: Record<string, string> = {
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".svg": "image/svg+xml",
};

/** Le miroir encode ?v=4.7.0 dans le nom de police. Next ne sert pas
 * ces noms spéciaux depuis public : servir leur alias, de mêmes octets,
 * sans modifier le CSS FontAwesome original. */
export async function GET(_request: Request, { params }: { params: Promise<{ font: string }> }) {
  const { font } = await params;
  if (!/^fontawesome-webfont\.(?:woff2?|ttf|eot|svg)\?(?:v=4\.7\.0)?$/.test(font)) {
    return new Response(null, { status: 404 });
  }
  const file = font.split("?")[0];
  const bytes = await readFile(path.join(process.cwd(), "public/assets/fonts", file));
  return new Response(new Uint8Array(bytes), {
    headers: { "Content-Type": formats[path.extname(file)], "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
