import { notFound } from "next/navigation";
import { TemplateRuntime } from "@/components/TemplateRuntime";
import { resolveTemplate, loadSearch, pageNames, type TemplatePageProps } from "@/lib/educavo";

export async function generateStaticParams() {
  return [{ path: [] }, ...(await pageNames()).map((name) => ({ path: name.split("/") }))];
}

export default async function TemplatePage({ params, searchParams }: TemplatePageProps & { searchParams: Promise<{q?: string | string[]}> }) {
  const resolved = await params;
  let template;
  if(resolved.path?.join('/') === 'recherche'){
    const query=(await searchParams).q;
    template=await loadSearch(Array.isArray(query)?query[0]??'':query??'');
  }else template=await resolveTemplate(resolved);
  if (!template) notFound();
  return (
    <>
      {template.content}
      <TemplateRuntime scripts={template.scripts} />
    </>
  );
}
