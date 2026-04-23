import { Container } from "~/components/container";
import { PostContent } from "~/components/post-content";
import { GoldDivider, OrnamentalCircles } from "~/components/decorative";
import { generateMeta, aboutPageJsonLd } from "~/lib/seo";

export function meta() {
  return [
    ...generateMeta({
      title: "Sobre",
      description:
        "Conheça Gisele de Menezes — terapeuta, praticante de Ayurveda, massoterapeuta e escritora.",
      url: "/sobre",
    }),
    aboutPageJsonLd(),
  ];
}

const aboutPage = {
  title: "Eu e minha caminhada",
  content: `<p>Sou mulher antiga, desde cedo muito antiga... ainda menina fui iniciada em ciências ocultas pelo meu avô materno. De lá para cá, muitas "fichas" caíram e, do que sei, pouco sei. Do que vivi, ainda estou digerindo os aprendizados. Do que não vivi, me esforço para sequer dar minha opinião. É tudo tão individualmente subjetivo, que por vezes é quase impossível aceitar que somos todos Um.</p><h2>Das individualizações -</h2><p>Escrevi um livro - Uma Viagem no Tempo, Uma Expedição no Espaço - Outra Índia, Outro Jesus,&nbsp; que foi publicado em 2009, essa edição já esgotou. Quem sabe um dia faço a segunda edição revisada e ampliada? Por que não?</p><p>Gosto demais de escrever. Quando estou escritora, escrevo textos que posto neste site/blog e também alguns que ainda não publiquei.</p><p>Facilito regularmente pequenos <a target="_blank" rel="noopener noreferrer nofollow" href="/trabalhos/">cursos de Ayurveda</a> com enfoque na diária de vida e alimentação, e já fazem duas décadas que atendo e ajudo muitas pessoas com Ayurveda, Tarô, Trabalho Corporal, Psicologia do Ayurveda, Orientações Xamânicas e quase sempre com tudo isso misturado em consultas onde a intuição é sempre meu guia mais brilhante.</p><h2>Novo -</h2><p>Estou participando de um lindo projeto literário, com data marcada para o lançamento na <a target="_blank" rel="noopener noreferrer nofollow" href="https://feiradolivro-poa.com.br/balcao-de-informacoes/#:~:text=SOBRE%20A%20FEIRA,outubro%20e%2015%20de%20novembro.">Feira do Livro de Porto Alegre!</a></p><p>Mulheres reunidas e a escrita como expressão do indizível, não pincelado a óleo em telas, não costurado em tecido, não assado em fornos, não moldado em barro, não possível expressado em qualquer forma que não seja escrito. E lançaremos juntas e sob a coordenação da jornalista e escritora Gisela Sparremberger, o quarto livro da série <a target="_blank" rel="noopener noreferrer nofollow" href="https://www.atenapoa.com.br/c%C3%B3pia-gisela-sparremberger-um-ano-d">Nosso Livro</a>.</p><p>Claro, sigo inovando no velho Curso de Massagem Método Gisele de Menezes, pois está sempre vivo. Agora é a criação de uma oficina que estamos batizando com o nome de Corpo, Chão e Som.</p>`,
};

export function headers() {
  return { "Cache-Control": "public, max-age=300, s-maxage=604800, stale-while-revalidate=86400" };
}

function splitContent(html: string) {
  const sections: { heading: string; html: string }[] = [];
  const parts = html.split(/<h2>/i);

  const intro = parts[0].trim();
  for (let i = 1; i < parts.length; i++) {
    const closeIdx = parts[i].indexOf("</h2>");
    const heading = parts[i].substring(0, closeIdx).replace(/ -$/, "").trim();
    const body = parts[i].substring(closeIdx + 5).trim();
    sections.push({ heading, html: body });
  }
  return { intro, sections };
}

const timelineEntries = [
  {
    year: "1999",
    text: "Formação em Yoga Massagem Ayurvédica — método da mestra indiana Kusum Modak",
  },
  { year: "1999", text: "Reiki I e II — Usui System of Reiki, Dhyan Vishua" },
  {
    year: "2002",
    text: "Bioenergética Reichiana — formação em massagens bioenergéticas, leitura corporal, healing tibetano",
  },
  {
    year: "2003",
    text: "Iniciação aos conhecimentos ancestrais pelo saber siberiano — xamã Severni Olenj",
  },
  {
    year: "2003",
    text: "Iniciação em Tarot Egípcio e Magia de Cleópatra — xamaniza Rasamaha, Escola Russa de Altay",
  },
  { year: "2004", text: "Cria o primeiro Curso de Massagem Método Gisele de Menezes" },
  { year: "2005", text: "Reiki Xamânico I e II" },
  {
    year: "2007",
    text: "Índia — 144 dias encontrando as raízes dos aprendizados. Curso de Ayurveda e Massagem da Energia Espiritual em Varanasi",
  },
  { year: "2007", text: "Meditação Vipassana — Dharamshala, Índia" },
  { year: "2008", text: "Formação em Vinyasa Flow Yoga" },
  { year: "2009", text: "Lançamento do livro Uma Viagem no Tempo, Uma Expedição no Espaço" },
  { year: "2010", text: "Funda o Povo em Pé — Centro de Yoga e Ayurveda em Porto Alegre" },
  {
    year: "2012",
    text: "Formação em Terapeuta Ayurveda — Escola Yoga Brahma Vidyalaya e American Institute of Vedic Studies",
  },
  {
    year: "2015",
    text: "Credenciamento como monitora e professora — 7 anos, 6 turmas, mais de 80 alunos formados",
  },
  {
    year: "2017",
    text: "Especializações na Índia — Ayurvedic Psychology, Kerala Panchakarma, Kayachikitsa e Garbha Samskar",
  },
];

const workshops = [
  "Oficina de recursos terapêuticos manuais — Univali (2004)",
  "Palestra sobre espiritualidade e sustentabilidade — Fpolis/SC (2005)",
  "Energia Primordial — Universidade Estácio de Sá (2006)",
  "Festival Mundial da Paz — UFSC (2006)",
  "Trabalho corporal — Unisul/SC (2007)",
  "Xamanismo siberiano — PUC/RS (2008)",
  "Tempo, para Despertar a Consciência — Esteio/RS (2008)",
  "Mulher Corpo e Alma — Unidade de Saúde Jardim Leopoldina (2010)",
  "Lei do Tempo — Casa Urusvati, São Paulo (2011)",
  "Congresso Brasileiro de Ayurveda online (2015)",
  "Palestras sobre Ayurveda em várias partes do Brasil (desde 2013)",
];

export default function About() {
  const { intro, sections } = splitContent(aboutPage.content);

  return (
    <div>
      <section className="relative py-14 overflow-hidden bg-bg-warm border-b border-border">
        <OrnamentalCircles />
        <Container>
          <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="shrink-0 text-center">
              <img
                src="/gisele-de-menezes.webp"
                alt="Gisele de Menezes"
                className="w-48 h-48 sm:w-56 sm:h-56 rounded-full object-cover border-4 border-accent/30 shadow-lg"
              />
              <p className="mt-2 text-xs text-text-muted italic">Março de 2026, com 61 anos.</p>
            </div>
            <div className="text-center md:text-left">
              <p className="section-label mb-3">✦ Sobre ✦</p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary mb-4">
                {aboutPage.title}
              </h1>
              <GoldDivider />
              <div
                className="text-text-muted leading-relaxed italic"
                dangerouslySetInnerHTML={{ __html: intro }}
              />
            </div>
          </div>
        </Container>
      </section>

      {sections.map((section, i) => (
        <section key={section.heading} className={i % 2 === 0 ? "py-12" : "py-12 bg-bg-warm"}>
          <Container>
            <h2 className="text-2xl font-bold text-primary mb-2">{section.heading}</h2>
            <GoldDivider />
            <PostContent html={section.html} />
          </Container>
        </section>
      ))}

      <section className="py-16 bg-bg-warm border-y border-border">
        <Container size="lg">
          <div className="text-center mb-10">
            <p className="section-label mb-3">✦ Caminhada ✦</p>
            <h2 className="text-3xl font-bold text-primary">Formações & Especializações</h2>
            <GoldDivider />
          </div>
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute left-[7px] top-0 bottom-0 w-px bg-gradient-to-b from-accent via-primary to-accent/30" />
            {timelineEntries.map((entry) => (
              <div
                key={`${entry.year}-${entry.text.substring(0, 20)}`}
                className="relative pl-10 pb-8 last:pb-0"
              >
                <div className="absolute left-0 top-0 w-4 h-4 flex items-center justify-center text-primary text-base -translate-x-px translate-y-px">
                  ✦
                </div>
                <p className="text-sm text-text-body leading-relaxed">
                  <span className="font-bold text-primary font-sans">{entry.year}</span>
                  {" — "}
                  {entry.text}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Container size="lg" className="py-16">
        <div className="text-center mb-10">
          <p className="section-label mb-3">✦ Compartilhar ✦</p>
          <h2 className="text-3xl font-bold text-primary">Oficinas & Palestras</h2>
          <GoldDivider />
        </div>
        <div className="max-w-2xl mx-auto space-y-3">
          {workshops.map((w) => (
            <div
              key={w}
              className="border-l-2 border-accent/40 pl-4 py-2 text-sm text-text-body leading-relaxed"
            >
              {w}
            </div>
          ))}
        </div>
      </Container>

      <section className="py-12 bg-bg-card border-y border-border -mb-16">
        <Container className="text-center">
          <p className="section-label mb-3">✦ Uma porta aberta ✦</p>
          <h2 className="text-2xl font-bold text-primary mb-4">Quer conversar?</h2>
          <p className="text-text-muted italic mb-6 max-w-md mx-auto">
            Para levar uma dessas palestras, consultas, ou simplesmente trocar uma ideia — ficarei
            feliz em ouvir você.
          </p>
          <a
            href="/contato"
            className="inline-block rounded bg-primary px-6 py-2.5 text-sm font-semibold text-white dark:text-bg border border-primary hover:bg-primary-dark hover:border-primary-dark transition-colors font-sans"
          >
            Entre em contato
          </a>
        </Container>
      </section>
    </div>
  );
}
