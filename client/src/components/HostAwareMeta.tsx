import { useEffect } from "react";
import { useSiteContext } from "@/hooks/useSiteContext";

type MetaConfig = {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  ogUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
};

const META_MAIN: MetaConfig = {
  title: "Metodo P.A.G.O — Novo Tempo | Reorganize sua vida com propósito",
  description:
    "Metodo P.A.G.O — Princípio, Alinhamento, Governo, Obediência. Um sistema de reorganização de vida para quem ama a Deus mas precisa de estrutura. Faça o diagnóstico gratuito.",
  keywords:
    "metodo pago, método pago, PAGO, novo tempo, reorganização de vida, diagnóstico cristão, mentoria cristã, princípio alinhamento governo obediência",
  canonical: "https://metodopago.com/",
  ogUrl: "https://metodopago.com",
  ogTitle: "Metodo P.A.G.O — Novo Tempo",
  ogDescription:
    "Um sistema de reorganização de vida. Princípio, Alinhamento, Governo, Obediência. Faça o diagnóstico gratuito.",
  ogImage: "https://metodopago.com/og-image.png",
  twitterTitle: "Metodo P.A.G.O — Novo Tempo",
  twitterDescription:
    "Um sistema de reorganização de vida. Princípio, Alinhamento, Governo, Obediência. Faça o diagnóstico gratuito.",
  twitterImage: "https://metodopago.com/og-image.png",
};

const META_CORP: MetaConfig = {
  title: "P.A.G.O Corporativo — Performance Humana Baseada em Fundamentos",
  description:
    "P.A.G.O Corporativo: avaliação organizacional baseada em 4 pilares — Princípio, Alinhamento, Governo, Obediência. Mais profundo que DISC e MBTI. Solicite uma demonstração.",
  keywords:
    "PAGO corporativo, performance humana, avaliação organizacional, B2B, alternativa DISC, alternativa MBTI, RH, recursos humanos, fit cultural, identidade integral",
  canonical: "https://pagocorp.com/",
  ogUrl: "https://pagocorp.com",
  ogTitle: "P.A.G.O Corporativo — Performance Humana",
  ogDescription:
    "Avaliação organizacional baseada em fundamentos. 4 pilares: Princípio, Alinhamento, Governo, Obediência. Solicite uma demonstração.",
  ogImage: "https://metodopago.com/og-image.png",
  twitterTitle: "P.A.G.O Corporativo",
  twitterDescription:
    "Avaliação organizacional baseada em fundamentos. 4 pilares: Princípio, Alinhamento, Governo, Obediência.",
  twitterImage: "https://metodopago.com/og-image.png",
};

function setMeta(selector: string, attr: "content" | "href", value: string) {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

export default function HostAwareMeta() {
  const site = useSiteContext();

  useEffect(() => {
    const m = site === "corp" ? META_CORP : META_MAIN;
    document.title = m.title;
    setMeta('meta[name="description"]', "content", m.description);
    setMeta('meta[name="keywords"]', "content", m.keywords);
    setMeta('link[rel="canonical"]', "href", m.canonical);
    setMeta('meta[property="og:url"]', "content", m.ogUrl);
    setMeta('meta[property="og:title"]', "content", m.ogTitle);
    setMeta('meta[property="og:description"]', "content", m.ogDescription);
    setMeta('meta[property="og:image"]', "content", m.ogImage);
    setMeta('meta[name="twitter:title"]', "content", m.twitterTitle);
    setMeta('meta[name="twitter:description"]', "content", m.twitterDescription);
    setMeta('meta[name="twitter:image"]', "content", m.twitterImage);
  }, [site]);

  return null;
}
