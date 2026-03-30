import type { Kysely } from "kysely";
import { sql } from "kysely";

const NEW_TAGS = [
  { name: "Yoga e Ayurveda", slug: "yoga-e-ayurveda" },
  { name: "Anatomia Exotérica", slug: "anatomia-exoterica" },
  { name: "Mulher", slug: "mulher" },
  { name: "Visões de Mundo", slug: "visoes-de-mundo" },
  { name: "Espiritualidade", slug: "espiritualidade" },
] as const;

type TagSlug = (typeof NEW_TAGS)[number]["slug"];

const POST_TAGS: Record<string, TagSlug[]> = {
  depoimentos: ["yoga-e-ayurveda"],
  "energia-primordial-saiba-o-que-fazer-com-ela": ["anatomia-exoterica"],
  "ritual-magico-de-asanas-do-tarot-egpcio": ["yoga-e-ayurveda"],
  "trabalho-corporal": ["yoga-e-ayurveda"],
  "vento-csmico": ["espiritualidade"],
  "ano-novo": ["visoes-de-mundo"],
  "maria-ou-joao-na-cidade-grande": ["visoes-de-mundo"],
  "oracao-essenia": ["espiritualidade"],
  "um-contato": ["mulher", "espiritualidade"],
  "estivemos-em-srinagar-lugar-sagrado-jesus-christ-tomb": ["espiritualidade"],
  "viagem-xamanica": ["espiritualidade"],
  "como-ajudar-o-meio-ambiente": ["visoes-de-mundo"],
  "grandiosidades-de-alexandre": ["espiritualidade"],
  "lave-sua-roupa": ["espiritualidade"],
  "frutas-alimento-sagrado": ["yoga-e-ayurveda"],
  "magia-de-cleopatra": ["mulher"],
  prolas: ["espiritualidade"],
  "seja-feliz": ["espiritualidade"],
  "mente-iluminada-dra-jill-bolte-taylor": ["anatomia-exoterica"],
  "gayatri-mantra": ["espiritualidade"],
  "orao-para-antes-das-refeies-paramahansa-yogananda": ["espiritualidade"],
  "meditao-a-chave": ["espiritualidade"],
  "conhece-te-a-ti-mesmo-a-sinergia-do-universo": ["espiritualidade"],
  "espiritualidade-e-sustentabilidade": ["visoes-de-mundo"],
  "a-cientista-que-curou-seu-proprio-cerebro-jill-bolte-taylor": ["anatomia-exoterica"],
  "grupo-de-trabalho-corporal": ["yoga-e-ayurveda"],
  "trabalhando-com-os-espritos-ancestrais": ["espiritualidade"],
  "por-voc-e-por-voc": ["visoes-de-mundo"],
  "uma-possibilidade-o-engano": ["espiritualidade"],
  "arcanos-maiores-do-tarot-egpcio-e-posturas-mgicas": ["anatomia-exoterica"],
  "1111-a-virada-da-mar": ["espiritualidade"],
  escutatria: ["espiritualidade"],
  "a-misria-humana": ["espiritualidade"],
  "uma-questao-de-escolha": ["visoes-de-mundo"],
  "depoimento-de-um-medico-vegetariano": ["yoga-e-ayurveda"],
  "os-sinais": ["espiritualidade"],
  "sexo-virtual": ["visoes-de-mundo"],
  "a-realidade-e-uma-ilusao-esteja-presente": ["espiritualidade"],
  "india-verdadeira": ["espiritualidade"],
  "a-chegada-dos-kumaras": ["espiritualidade"],
  "quantas-vezes-ja-disse-que-te-amo": ["espiritualidade"],
  "curso-de-massagem-indiana": ["yoga-e-ayurveda"],
  "la-belle-verte": ["visoes-de-mundo", "espiritualidade"],
  "informe-publicitario": ["visoes-de-mundo"],
  "pequenos-seres-humanos": ["visoes-de-mundo"],
  "mooji-um-ser-humano": ["espiritualidade"],
  "mensagem-para-este-momento": ["espiritualidade"],
  "curso-de-massagem-indiana-em-florianopolis": ["yoga-e-ayurveda"],
  "palestra-corpo-e-alma-usjl-semana-da-mulher": ["mulher", "anatomia-exoterica"],
  "equilibrio-ou-sucesso": ["visoes-de-mundo"],
  "primeira-formacao-de-iyengar-yoga-do-rio-grande-do-sul": ["yoga-e-ayurveda"],
  "mulheres-gravidas-parto-natural-usinas-hidreletricas": ["mulher", "visoes-de-mundo"],
  "a-cura-do-cancer-e-o-nosso-fim": ["anatomia-exoterica", "yoga-e-ayurveda"],
  "medo-2012-matrix": ["visoes-de-mundo"],
  "canalizacao-para-agora": ["espiritualidade"],
  "estar-no-eixo": ["espiritualidade"],
  "vazamento-no-golfo-e-o-mundo-ve-a-copa": ["visoes-de-mundo"],
  "prece-para-o-golfo-do-mexico": ["visoes-de-mundo"],
  contemplacao: ["yoga-e-ayurveda"],
  "auxiliando-os-pleiadianos": ["espiritualidade"],
  "portal-10-10-10": ["espiritualidade"],
  "o-silencio": ["espiritualidade"],
  "o-espirito-do-tempo": ["visoes-de-mundo"],
  "o-numero-13-e-o-tempo": ["espiritualidade"],
  meditacao: ["yoga-e-ayurveda"],
  "massagem-espiritual": ["yoga-e-ayurveda"],
  "manifesto-pela-noosfera-jose-arguelles": ["espiritualidade"],
  "festival-da-paz-atraves-da-cultura": ["espiritualidade"],
  "qando-me-amei-de-verdade": ["mulher", "espiritualidade"],
  "triade-de-eclipses": ["espiritualidade"],
  "aos-leitores": ["espiritualidade"],
  "o-transito-deste-feriado-%e2%80%93-br-101-o-transito-deste-feriado-%e2%80%93-br-101": [
    "visoes-de-mundo",
  ],
  "oracao-de-swami-dayananda": ["espiritualidade"],
  "festas-de-final-de-ano": ["espiritualidade"],
  "salto-alto-um-elo-com-a-escravidao": ["visoes-de-mundo", "mulher"],
  "feliz-natal": ["espiritualidade"],
  "feliz-ano-novo": ["espiritualidade"],
  "nicholas-roerich-jose-arguelles-bandeira-da-paz-e-tempo-natural": ["visoes-de-mundo"],
  "lua-cheia": ["espiritualidade"],
  "bandeira-da-paz": ["espiritualidade"],
  "carnaval-incitacao-ao-sexo": ["visoes-de-mundo"],
  "o-mundo-nao-vai-acabar-ele-sera-transformado": ["espiritualidade"],
  "transito-de-venus-quetzalcoatl-e-a-profecia-2012": ["espiritualidade"],
  "rio-20-poderia-ser-rio-1320": ["visoes-de-mundo"],
  "dieta-magica-para-lindas-mulheres": ["yoga-e-ayurveda"],
  "a-melhor-campanha-publicitaria": ["visoes-de-mundo"],
  "encerramento-do-ciclo-21-de-dezembro-de-2012": ["espiritualidade"],
  "lei-do-tempo-e-arte-na-nova-era": ["espiritualidade"],
  "santa-maria-incidente-em-santa-maria-um-fractal-de-auschwitz": ["visoes-de-mundo"],
  "nova-era-de-harmonia-compaixao-paz-e-amor-verdadeiro": ["espiritualidade"],
  "compartilhar-no-facebook-mente-natural": ["espiritualidade"],
  "a-massagem-que-faco-amo-e-ensino": ["yoga-e-ayurveda"],
  "onde-vem": ["espiritualidade"],
  "o-preco-da-beleza": ["yoga-e-ayurveda"],
  "massagem-indiana-gisele-menezes": ["yoga-e-ayurveda"],
  "ajustes-no-yoga-amor-presenca": ["yoga-e-ayurveda"],
  "o-mago-botas": ["visoes-de-mundo"],
  "alimentacao-ayurveda-bom-senso": ["yoga-e-ayurveda"],
  "percepcao-individual-sobre-o-trabalho-corporal": ["yoga-e-ayurveda"],
  "luz-coracao-ardente": ["espiritualidade", "anatomia-exoterica"],
  "resultado-verdadeiro": ["yoga-e-ayurveda"],
  "o-segredo-da-longevidade": ["yoga-e-ayurveda"],
  "quem-esta-feliz": ["espiritualidade"],
  "guardioes-do-simples-e-saudavel": ["yoga-e-ayurveda"],
  "a-tradicao-o-ayurveda": ["yoga-e-ayurveda"],
  "de-volta-para-india-2017": ["yoga-e-ayurveda"],
  "todos-os-momentos-na-teia": ["espiritualidade"],
  "reflexoes-na-terra-hindu": ["visoes-de-mundo"],
  "rede-social-a-folia-dos-elementos": ["visoes-de-mundo"],
  "menopausa-a-transformacao-real": ["mulher"],
  "mae-divina": ["mulher"],
  "sacrificio-e-a-relacao-que-estabelecemos": ["espiritualidade"],
  "cursos-capacitacoes-vivencias": ["yoga-e-ayurveda"],
  "circulando-sob-galaxias-giratorias": ["espiritualidade"],
  "dissolvendo-a-bruxaria": ["visoes-de-mundo"],
  "consagracao-do-brasil-a-saint-germain": ["espiritualidade"],
  "ghee-a-essencia-do-reino-animal": ["yoga-e-ayurveda"],
  "alimento-e-vida": ["yoga-e-ayurveda"],
  "de-mulher-para-mulher-rito-de-passagem": ["mulher"],
  "asanas-percepcao-esqueleto": ["yoga-e-ayurveda"],
  "temos-para-onde-ir": ["espiritualidade"],
  "o-que-esta-realmente-acontecendo": ["visoes-de-mundo", "espiritualidade"],
  cancer: ["anatomia-exoterica", "yoga-e-ayurveda"],
  "os-deuses-e-a-deusa": ["mulher", "espiritualidade"],
  "o-que-mudou-na-minha-vida": ["yoga-e-ayurveda"],
  "mulher-dia-mes-ano-tempo-mulher": ["mulher"],
  "outono-pandemia-novo-ciclo": ["visoes-de-mundo", "espiritualidade"],
  "a-relacao-corpo-espaco-e-criacao": ["anatomia-exoterica"],
  insonia: ["yoga-e-ayurveda"],
  "siga-o-corpo-e-a-vida": ["espiritualidade"],
  "os-lados-e-a-totalidade": ["espiritualidade"],
  "levantando-minha-bandeira": ["visoes-de-mundo", "mulher"],
  "quem-e-meu-presidente": ["visoes-de-mundo"],
  "oracao-para-engravidar": ["mulher"],
  "desde-o-coracao-em-todas-as-direcoes": ["anatomia-exoterica"],
};

export async function up(db: Kysely<never>): Promise<void> {
  await sql`DELETE FROM post_tags`.execute(db);
  await sql`DELETE FROM tags`.execute(db);

  for (const tag of NEW_TAGS) {
    await sql`INSERT INTO tags (name, slug) VALUES (${tag.name}, ${tag.slug})`.execute(db);
  }

  const tagRows = await sql<{ id: string; slug: string }>`SELECT id, slug FROM tags`.execute(db);
  const tagIdBySlug = new Map(tagRows.rows.map((r) => [r.slug, r.id]));

  const postRows = await sql<{ id: string; slug: string }>`
    SELECT id, slug FROM posts WHERE status = 'published' AND post_type = 'post'
  `.execute(db);

  for (const post of postRows.rows) {
    const tagSlugs = POST_TAGS[post.slug];
    if (!tagSlugs) continue;
    for (const tagSlug of tagSlugs) {
      const tagId = tagIdBySlug.get(tagSlug);
      if (!tagId) continue;
      await sql`INSERT INTO post_tags (post_id, tag_id) VALUES (${post.id}, ${tagId})`.execute(db);
    }
  }
}

export async function down(db: Kysely<never>): Promise<void> {
  await sql`DELETE FROM post_tags`.execute(db);
}
