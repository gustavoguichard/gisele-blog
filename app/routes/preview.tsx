import { fromSuccess } from "composable-functions";
import type { Route } from "./+types/preview";
import { fetchRecentPosts } from "~/db/queries.server";
import { formatDate, stripHtml, truncate } from "~/lib/format";

const SAMPLE_BODY = `
<h1>O caminho do autoconhecimento</h1>
<p>Existe um momento na vida em que percebemos que <strong>tudo está conectado</strong> — o corpo, a mente, o espírito. A jornada do autoconhecimento não é linear, mas cada passo nos aproxima de quem realmente somos. Como dizia <em>Osho</em>: "A verdadeira questão não é se existe vida após a morte, mas se você está vivo antes da morte."</p>

<h2>As raízes da Ayurveda</h2>
<p>A Ayurveda, ciência milenar da <a href="#">Índia antiga</a>, nos ensina que a saúde não é apenas a ausência de doença — é um estado de equilíbrio entre corpo, mente e consciência. Cada pessoa possui uma constituição única, chamada <em>prakriti</em>, que determina suas tendências físicas e emocionais.</p>

<blockquote>
  <p>"Quando a dieta é errada, a medicina não funciona. Quando a dieta é correta, a medicina não é necessária."</p>
</blockquote>

<h3>Os três doshas</h3>
<p>Na Ayurveda, existem três energias fundamentais que governam nosso organismo:</p>
<ul>
  <li><strong>Vata</strong> — o princípio do movimento, ligado ao ar e ao éter</li>
  <li><strong>Pitta</strong> — o princípio da transformação, ligado ao fogo e à água</li>
  <li><strong>Kapha</strong> — o princípio da estrutura, ligado à terra e à água</li>
</ul>

<h4>Encontrando seu equilíbrio</h4>
<p>O autoconhecimento ayurvédico começa pela observação atenta do próprio corpo. Preste atenção nos sinais que ele oferece diariamente — a qualidade do sono, a digestão, a disposição ao acordar.</p>

<p>Uma prática simples para começar é o <code>dinacharya</code> — a rotina diária ayurvédica. Ela inclui acordar antes do sol, limpar a língua, beber água morna e dedicar alguns minutos à meditação.</p>

<h5>Nota sobre as estações</h5>
<p>Cada estação do ano pede uma adaptação na alimentação e nos hábitos. No inverno, alimentos quentes e nutritivos equilibram Vata. No verão, frutas frescas e ervas aromáticas acalmam Pitta.</p>

<figure>
  <img src="https://www.giseledemenezes.com/wp-content/uploads/2021/09/India-2754.jpg" alt="Paisagem na Índia" />
  <figcaption>Os templos do sul da Índia, onde a tradição ayurvédica permanece viva</figcaption>
</figure>

<hr />

<h3>Uma receita para a alma</h3>
<p>Prepare um <strong>chá golden milk</strong> com os seguintes ingredientes:</p>
<ol>
  <li>1 xícara de leite vegetal</li>
  <li>½ colher de chá de cúrcuma</li>
  <li>1 pitada de pimenta-do-reino</li>
  <li>1 colher de chá de mel (adicionar após amornar)</li>
</ol>

<pre><code>Aqueça o leite com a cúrcuma e a pimenta.
Mexa suavemente por 3 minutos.
Deixe amornar e adicione o mel.
Beba antes de dormir.</code></pre>

<p>Este ritual simples, feito com <em>presença e intenção</em>, pode transformar a qualidade do seu sono e trazer paz ao final do dia. Lembre-se: <strong>a cura começa nos pequenos gestos cotidianos</strong>.</p>
`;

export function meta() {
  return [{ title: "Preview — Escolha o estilo" }];
}

export async function loader() {
  const posts = await fromSuccess(fetchRecentPosts)(3);
  return { posts };
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: Date | string | null;
}

function PostPreview({ post, style }: { post: Post; style: React.CSSProperties }) {
  const excerpt = post.excerpt ? truncate(stripHtml(post.excerpt), 100) : "";
  return (
    <div style={style} className="overflow-hidden">
      <div className="aspect-[16/10] overflow-hidden">
        {post.featuredImage ? (
          <img
            src={post.featuredImage}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: "linear-gradient(135deg, #e8e0d4, #d4c8b8)" }}
          />
        )}
      </div>
      <div className="p-4">
        <p className="text-xs opacity-60 mb-1">{formatDate(post.publishedAt)}</p>
        <h4 className="font-bold leading-snug mb-2" style={{ fontSize: "1.05rem" }}>
          {post.title}
        </h4>
        {excerpt && <p className="text-sm opacity-70 leading-relaxed">{excerpt}</p>}
      </div>
    </div>
  );
}

function BodyPreview({ html, className }: { html: string; className: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function Preview({ loaderData }: Route.ComponentProps) {
  const { posts } = loaderData;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-3xl font-bold mb-3">Escolha o estilo</h1>
        <p className="text-text-muted">5 variações — do sutil ao expressivo</p>
      </div>

      {/* ── Version 1: Bold Expressive (Light) ── */}
      <section className="mb-20">
        <h2 className="text-sm font-sans font-semibold uppercase tracking-widest text-text-muted mb-6">
          1 — Bold Expressive (Light)
        </h2>
        <div
          style={{
            background: "#FBF8F4",
            color: "#2C2418",
            fontFamily: "'Merriweather', Georgia, serif",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid #E0D5C7",
          }}
        >
          <div
            style={{
              padding: "20px 32px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #E0D5C7",
            }}
          >
            <span style={{ fontSize: "1.4rem", fontWeight: 700, color: "#8B5E34" }}>
              Gisele de Menezes
            </span>
            <div
              style={{
                display: "flex",
                gap: "24px",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.8rem",
                fontWeight: 500,
                color: "#7A6E5F",
              }}
            >
              <span>Blog</span>
              <span>Sobre</span>
            </div>
          </div>
          <div
            style={{
              padding: "80px 32px",
              background: "linear-gradient(135deg, #F5EDE0 0%, #FBF8F4 100%)",
            }}
          >
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase" as const,
                color: "#8B5E34",
                marginBottom: "20px",
              }}
            >
              Terapeuta · Escritora · Ayurveda
            </p>
            <h3
              style={{
                fontSize: "3rem",
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                maxWidth: "600px",
                marginBottom: "24px",
                color: "#2C2418",
              }}
            >
              Bem-vinda ao
              <span style={{ display: "block", color: "#8B5E34" }}>meu espaço</span>
            </h3>
            <p
              style={{ fontSize: "1.05rem", color: "#7A6E5F", maxWidth: "460px", lineHeight: 1.8 }}
            >
              Reflexões sobre saúde, espiritualidade e os caminhos do autoconhecimento.
            </p>
          </div>
          <div
            style={{
              padding: "32px",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
            }}
          >
            {posts.map((post) => (
              <PostPreview
                key={post.id}
                post={post}
                style={{ background: "#fff", borderRadius: "12px", border: "1px solid #E0D5C7" }}
              />
            ))}
          </div>
          {/* Article body */}
          <div style={{ borderTop: "1px solid #E0D5C7", padding: "48px 32px" }}>
            <div style={{ maxWidth: "680px", margin: "0 auto" }}>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#8B5E34",
                  marginBottom: "16px",
                }}
              >
                15 de junho de 2024
              </p>
              <h3
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  marginBottom: "32px",
                  color: "#2C2418",
                }}
              >
                O caminho do autoconhecimento
              </h3>
              <BodyPreview
                html={SAMPLE_BODY}
                className="prose prose-lg max-w-none prose-p:text-[#3D342B] prose-p:leading-[1.9] prose-headings:text-[#2C2418] prose-headings:tracking-tight prose-a:text-[#8B5E34] prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-[#8B5E34] prose-blockquote:text-[#6B5D4F] prose-strong:text-[#2C2418] prose-img:rounded-lg prose-hr:border-[#E0D5C7] prose-code:text-[#8B5E34] prose-code:bg-[#F5EDE0] prose-pre:bg-[#2C2418] prose-pre:text-[#F5EDE0]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Version 2: Artistic Maximalist (Light) ── */}
      <section className="mb-20">
        <h2 className="text-sm font-sans font-semibold uppercase tracking-widest text-text-muted mb-6">
          2 — Artistic Maximalist (Light)
        </h2>
        <div
          style={{
            background: "#FAF6F0",
            color: "#2A2118",
            fontFamily: "'Merriweather', Georgia, serif",
            borderRadius: "16px",
            overflow: "hidden",
            position: "relative" as const,
          }}
        >
          <div
            style={{
              height: "4px",
              background: "linear-gradient(90deg, #C49A6C, #E8C496, #8B5E34, #C49A6C)",
            }}
          />
          <div
            style={{
              padding: "20px 32px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #E0D5C7",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  color: "#8B5E34",
                  letterSpacing: "-0.02em",
                }}
              >
                Gisele
              </span>
              <span
                style={{
                  display: "block",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.6rem",
                  fontWeight: 500,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase" as const,
                  color: "#B8A48C",
                  marginTop: "-2px",
                }}
              >
                de Menezes
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  border: "1px solid #D4C4AE",
                  padding: "8px 20px",
                  borderRadius: "4px",
                  color: "#8B5E34",
                }}
              >
                Blog
              </span>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  border: "1px solid #D4C4AE",
                  padding: "8px 20px",
                  borderRadius: "4px",
                  color: "#8B5E34",
                }}
              >
                Sobre
              </span>
            </div>
          </div>
          <div
            style={{
              padding: "80px 32px 70px",
              textAlign: "center",
              position: "relative" as const,
              background: "linear-gradient(180deg, #F5EDE0 0%, #FAF6F0 100%)",
            }}
          >
            <div
              style={{
                position: "absolute" as const,
                top: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "280px",
                height: "280px",
                borderRadius: "50%",
                border: "1px solid rgba(139, 94, 52, 0.08)",
                pointerEvents: "none" as const,
              }}
            />
            <div
              style={{
                position: "absolute" as const,
                top: "50px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                border: "1px solid rgba(139, 94, 52, 0.05)",
                pointerEvents: "none" as const,
              }}
            />
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.35em",
                textTransform: "uppercase" as const,
                color: "#C49A6C",
                marginBottom: "28px",
              }}
            >
              ✦ Terapeuta &middot; Escritora &middot; Ayurveda ✦
            </p>
            <h3
              style={{
                fontSize: "3.2rem",
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                marginBottom: "20px",
                position: "relative" as const,
              }}
            >
              <span style={{ color: "#8B5E34" }}>Bem-vinda</span>
              <br />
              <span style={{ fontStyle: "italic", fontWeight: 400, color: "#5C4D3C" }}>
                ao meu espaço
              </span>
            </h3>
            <div
              style={{ width: "40px", height: "1px", background: "#C49A6C", margin: "24px auto" }}
            />
            <p
              style={{
                fontSize: "1rem",
                color: "#8A7D6D",
                maxWidth: "420px",
                margin: "0 auto",
                lineHeight: 1.9,
                fontStyle: "italic",
              }}
            >
              Um lugar sagrado para reflexões sobre saúde, espiritualidade e autoconhecimento.
            </p>
          </div>
          <div
            style={{
              padding: "0 32px 32px",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
            }}
          >
            {posts.map((post) => (
              <PostPreview
                key={post.id}
                post={post}
                style={{
                  background: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #E0D5C7",
                }}
              />
            ))}
          </div>
          {/* Article body */}
          <div
            style={{
              borderTop: "1px solid #E0D5C7",
              padding: "48px 32px",
              position: "relative" as const,
            }}
          >
            <div style={{ maxWidth: "680px", margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.6rem",
                    fontWeight: 600,
                    letterSpacing: "0.35em",
                    textTransform: "uppercase",
                    color: "#C49A6C",
                    marginBottom: "16px",
                  }}
                >
                  ✦ 15 de junho de 2024 ✦
                </p>
                <h3
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    lineHeight: 1.15,
                    letterSpacing: "-0.02em",
                    color: "#8B5E34",
                  }}
                >
                  O caminho do autoconhecimento
                </h3>
                <div
                  style={{
                    width: "60px",
                    height: "1px",
                    background: "linear-gradient(90deg, transparent, #C49A6C, transparent)",
                    margin: "28px auto",
                  }}
                />
              </div>
              <BodyPreview
                html={SAMPLE_BODY}
                className="prose prose-lg max-w-none prose-p:text-[#4A3F34] prose-p:leading-[2] prose-headings:text-[#8B5E34] prose-headings:tracking-tight prose-a:text-[#8B5E34] prose-a:no-underline prose-a:border-b prose-a:border-[rgba(139,94,52,0.3)] hover:prose-a:border-[#8B5E34] prose-blockquote:border-l-[#C49A6C] prose-blockquote:text-[#6B5D4F] prose-blockquote:italic prose-strong:text-[#2A2118] prose-img:rounded-xl prose-img:border prose-img:border-[#E0D5C7] prose-hr:border-[#E0D5C7] prose-figcaption:text-[#8A7D6D] prose-figcaption:italic prose-code:text-[#8B5E34] prose-code:bg-[#F5EDE0] prose-pre:bg-[#2A2118] prose-pre:text-[#F0E6D6]"
              />
            </div>
          </div>
          <div
            style={{
              height: "4px",
              background: "linear-gradient(90deg, #C49A6C, #E8C496, #8B5E34, #C49A6C)",
            }}
          />
        </div>
      </section>

      {/* ── Version 3: Warm Organic ── */}
      <section className="mb-20">
        <h2 className="text-sm font-sans font-semibold uppercase tracking-widest text-text-muted mb-6">
          3 — Warm Organic
        </h2>
        <div
          style={{
            background: "linear-gradient(180deg, #F5EDE0 0%, #FBF7F0 40%)",
            color: "#3D342B",
            fontFamily: "'Merriweather', Georgia, serif",
            borderRadius: "20px",
            overflow: "hidden",
            border: "1px solid #D9CEBD",
          }}
        >
          <div
            style={{
              padding: "20px 32px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "1.3rem", fontWeight: 700, color: "#7D5E3C" }}>
              ✦ Gisele de Menezes
            </span>
            <div
              style={{
                display: "flex",
                gap: "20px",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.8rem",
              }}
            >
              <span
                style={{
                  background: "#7D5E3C",
                  color: "#fff",
                  padding: "6px 16px",
                  borderRadius: "99px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                Blog
              </span>
              <span
                style={{
                  border: "1px solid #C4B39A",
                  padding: "6px 16px",
                  borderRadius: "99px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#7D5E3C",
                }}
              >
                Sobre
              </span>
            </div>
          </div>
          <div style={{ padding: "60px 32px", textAlign: "center" }}>
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #C49A6C, #7D5E3C)",
                margin: "0 auto 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "1.5rem",
              }}
            >
              ◎
            </div>
            <h3
              style={{
                fontSize: "2.25rem",
                fontWeight: 700,
                color: "#7D5E3C",
                lineHeight: 1.3,
                marginBottom: "16px",
              }}
            >
              Bem-vinda ao meu espaço
            </h3>
            <p
              style={{
                fontSize: "1.05rem",
                color: "#7A6E5F",
                maxWidth: "480px",
                margin: "0 auto",
                lineHeight: 1.8,
              }}
            >
              Um lugar para reflexões sobre saúde, espiritualidade e os caminhos do
              autoconhecimento.
            </p>
          </div>
          <div
            style={{
              padding: "0 32px 32px",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
            }}
          >
            {posts.map((post) => (
              <PostPreview
                key={post.id}
                post={post}
                style={{
                  background: "#fff",
                  borderRadius: "16px",
                  border: "1px solid #D9CEBD",
                  boxShadow: "0 2px 12px rgba(125, 94, 60, 0.06)",
                }}
              />
            ))}
          </div>
          {/* Article body */}
          <div
            style={{ padding: "48px 32px", background: "#FFFCF7", borderTop: "1px solid #D9CEBD" }}
          >
            <div style={{ maxWidth: "680px", margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.75rem",
                    color: "#7D5E3C",
                    fontWeight: 600,
                    marginBottom: "12px",
                  }}
                >
                  15 de junho de 2024
                </p>
                <h3
                  style={{ fontSize: "2rem", fontWeight: 700, color: "#7D5E3C", lineHeight: 1.3 }}
                >
                  O caminho do autoconhecimento
                </h3>
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    border: "2px solid #D9CEBD",
                    margin: "20px auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    color: "#C4B39A",
                  }}
                >
                  ✦
                </div>
              </div>
              <BodyPreview
                html={SAMPLE_BODY}
                className="prose prose-lg max-w-none prose-p:leading-[1.9] prose-p:text-[#4A3F34] prose-a:text-[#7D5E3C] prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-[#C49A6C] prose-blockquote:bg-[#F5EDE0] prose-blockquote:rounded-r-xl prose-blockquote:py-4 prose-blockquote:px-6 prose-img:rounded-2xl prose-headings:text-[#7D5E3C]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Version 4: Bold Expressive ── */}
      <section className="mb-20">
        <h2 className="text-sm font-sans font-semibold uppercase tracking-widest text-text-muted mb-6">
          4 — Bold Expressive
        </h2>
        <div
          style={{
            background: "#2C2418",
            color: "#F5EDE0",
            fontFamily: "'Merriweather', Georgia, serif",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "20px 32px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(245,237,224,0.12)",
            }}
          >
            <span style={{ fontSize: "1.4rem", fontWeight: 700, color: "#D4A574" }}>
              Gisele de Menezes
            </span>
            <div
              style={{
                display: "flex",
                gap: "24px",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.8rem",
                fontWeight: 500,
                color: "rgba(245,237,224,0.7)",
              }}
            >
              <span>Blog</span>
              <span>Sobre</span>
            </div>
          </div>
          <div
            style={{
              padding: "80px 32px",
              background: "linear-gradient(135deg, #2C2418 0%, #3D2E1C 100%)",
            }}
          >
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase" as const,
                color: "#D4A574",
                marginBottom: "20px",
              }}
            >
              Terapeuta · Escritora · Ayurveda
            </p>
            <h3
              style={{
                fontSize: "3rem",
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                maxWidth: "600px",
                marginBottom: "24px",
              }}
            >
              Bem-vinda ao
              <span style={{ display: "block", color: "#D4A574" }}>meu espaço</span>
            </h3>
            <p
              style={{
                fontSize: "1.05rem",
                color: "rgba(245,237,224,0.65)",
                maxWidth: "460px",
                lineHeight: 1.8,
              }}
            >
              Reflexões sobre saúde, espiritualidade e os caminhos do autoconhecimento.
            </p>
          </div>
          <div
            style={{
              padding: "32px",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
            }}
          >
            {posts.map((post) => (
              <PostPreview
                key={post.id}
                post={post}
                style={{
                  background: "rgba(245,237,224,0.06)",
                  borderRadius: "12px",
                  border: "1px solid rgba(245,237,224,0.1)",
                  color: "#F5EDE0",
                }}
              />
            ))}
          </div>
          {/* Article body */}
          <div style={{ borderTop: "1px solid rgba(245,237,224,0.1)", padding: "48px 32px" }}>
            <div style={{ maxWidth: "680px", margin: "0 auto" }}>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#D4A574",
                  marginBottom: "16px",
                }}
              >
                15 de junho de 2024
              </p>
              <h3
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  marginBottom: "32px",
                }}
              >
                O caminho do autoconhecimento
              </h3>
              <BodyPreview
                html={SAMPLE_BODY}
                className="prose prose-lg prose-invert max-w-none prose-p:text-[rgba(245,237,224,0.8)] prose-p:leading-[1.9] prose-headings:text-[#F5EDE0] prose-a:text-[#D4A574] prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-[#D4A574] prose-blockquote:text-[rgba(245,237,224,0.6)] prose-strong:text-[#F5EDE0] prose-img:rounded-lg prose-hr:border-[rgba(245,237,224,0.12)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Version 5: Artistic Maximalist ── */}
      <section className="mb-20">
        <h2 className="text-sm font-sans font-semibold uppercase tracking-widest text-text-muted mb-6">
          5 — Artistic Maximalist
        </h2>
        <div
          style={{
            background: "#1C1410",
            color: "#F0E6D6",
            fontFamily: "'Merriweather', Georgia, serif",
            borderRadius: "16px",
            overflow: "hidden",
            position: "relative" as const,
          }}
        >
          <div
            style={{
              height: "4px",
              background: "linear-gradient(90deg, #C49A6C, #E8C496, #8B5E34, #C49A6C)",
            }}
          />
          <div
            style={{
              padding: "20px 32px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  color: "#E8C496",
                  letterSpacing: "-0.02em",
                }}
              >
                Gisele
              </span>
              <span
                style={{
                  display: "block",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.6rem",
                  fontWeight: 500,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase" as const,
                  color: "rgba(232,196,150,0.5)",
                  marginTop: "-2px",
                }}
              >
                de Menezes
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  border: "1px solid rgba(232,196,150,0.3)",
                  padding: "8px 20px",
                  borderRadius: "4px",
                  color: "#E8C496",
                }}
              >
                Blog
              </span>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  border: "1px solid rgba(232,196,150,0.3)",
                  padding: "8px 20px",
                  borderRadius: "4px",
                  color: "#E8C496",
                }}
              >
                Sobre
              </span>
            </div>
          </div>
          <div
            style={{
              padding: "80px 32px 70px",
              textAlign: "center",
              position: "relative" as const,
            }}
          >
            <div
              style={{
                position: "absolute" as const,
                top: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "280px",
                height: "280px",
                borderRadius: "50%",
                border: "1px solid rgba(232,196,150,0.1)",
                pointerEvents: "none" as const,
              }}
            />
            <div
              style={{
                position: "absolute" as const,
                top: "50px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                border: "1px solid rgba(232,196,150,0.06)",
                pointerEvents: "none" as const,
              }}
            />
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.35em",
                textTransform: "uppercase" as const,
                color: "#C49A6C",
                marginBottom: "28px",
              }}
            >
              ✦ Terapeuta &middot; Escritora &middot; Ayurveda ✦
            </p>
            <h3
              style={{
                fontSize: "3.2rem",
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                marginBottom: "20px",
                position: "relative" as const,
              }}
            >
              <span style={{ color: "#E8C496" }}>Bem-vinda</span>
              <br />
              <span
                style={{ fontStyle: "italic", fontWeight: 400, color: "rgba(240,230,214,0.8)" }}
              >
                ao meu espaço
              </span>
            </h3>
            <div
              style={{ width: "40px", height: "1px", background: "#C49A6C", margin: "24px auto" }}
            />
            <p
              style={{
                fontSize: "1rem",
                color: "rgba(240,230,214,0.55)",
                maxWidth: "420px",
                margin: "0 auto",
                lineHeight: 1.9,
                fontStyle: "italic",
              }}
            >
              Um lugar sagrado para reflexões sobre saúde, espiritualidade e autoconhecimento.
            </p>
          </div>
          <div
            style={{
              padding: "0 32px 32px",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
            }}
          >
            {posts.map((post) => (
              <PostPreview
                key={post.id}
                post={post}
                style={{
                  background: "rgba(232,196,150,0.04)",
                  borderRadius: "8px",
                  border: "1px solid rgba(232,196,150,0.12)",
                  color: "#F0E6D6",
                }}
              />
            ))}
          </div>
          {/* Article body */}
          <div
            style={{
              borderTop: "1px solid rgba(232,196,150,0.15)",
              padding: "48px 32px",
              position: "relative" as const,
            }}
          >
            <div style={{ maxWidth: "680px", margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.6rem",
                    fontWeight: 600,
                    letterSpacing: "0.35em",
                    textTransform: "uppercase",
                    color: "#C49A6C",
                    marginBottom: "16px",
                  }}
                >
                  ✦ 15 de junho de 2024 ✦
                </p>
                <h3
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    lineHeight: 1.15,
                    letterSpacing: "-0.02em",
                    color: "#E8C496",
                  }}
                >
                  O caminho do autoconhecimento
                </h3>
                <div
                  style={{
                    width: "60px",
                    height: "1px",
                    background: "linear-gradient(90deg, transparent, #C49A6C, transparent)",
                    margin: "28px auto",
                  }}
                />
              </div>
              <BodyPreview
                html={SAMPLE_BODY}
                className="prose prose-lg prose-invert max-w-none prose-p:text-[rgba(240,230,214,0.75)] prose-p:leading-[2] prose-headings:text-[#E8C496] prose-headings:tracking-tight prose-a:text-[#E8C496] prose-a:no-underline prose-a:border-b prose-a:border-[rgba(232,196,150,0.3)] hover:prose-a:border-[#E8C496] prose-blockquote:border-l-[#C49A6C] prose-blockquote:text-[rgba(240,230,214,0.55)] prose-blockquote:italic prose-strong:text-[#F0E6D6] prose-img:rounded-xl prose-img:border prose-img:border-[rgba(232,196,150,0.1)] prose-hr:border-[rgba(232,196,150,0.12)] prose-figcaption:text-[rgba(240,230,214,0.4)] prose-figcaption:italic"
              />
            </div>
          </div>
          <div
            style={{
              height: "4px",
              background: "linear-gradient(90deg, #C49A6C, #E8C496, #8B5E34, #C49A6C)",
            }}
          />
        </div>
      </section>
    </div>
  );
}
