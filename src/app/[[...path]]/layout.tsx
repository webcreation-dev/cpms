import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { loadTemplate, resolveTemplate, type TemplatePageProps } from "@/lib/educavo";

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export async function generateMetadata({ params }: TemplatePageProps): Promise<Metadata> {
  const template = await resolveTemplate(await params);
  return {
    title: template?.title ?? "CPMS",
    description: template?.description ?? "Cycle Préparatoire Sainte Marie Stella à Cotonou.",
    icons: { icon: template?.favicon ?? "/assets/images/fav.png" },
  };
}

export default async function TemplateLayout({ children, params }: TemplatePageProps & { children: ReactNode }) {
  const template = (await resolveTemplate(await params)) ?? (await loadTemplate("error.html"))!;
  return (
    <html lang={template.editorial ? "fr" : "en"}>
      <head>
        {template.styles.map((href) => <link key={href} rel="stylesheet" type="text/css" href={href} />)}
      </head>
      <body className={template.bodyClass}>{children}</body>
    </html>
  );
}
