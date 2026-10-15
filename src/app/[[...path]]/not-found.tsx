import { TemplateRuntime } from "@/components/TemplateRuntime";
import { loadTemplate } from "@/lib/educavo";

export default async function NotFound() {
  const template = (await loadTemplate("error.html"))!;
  return <>{template.content}<TemplateRuntime scripts={template.scripts} /></>;
}
