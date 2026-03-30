import type { Kysely } from "kysely";
import { sql } from "kysely";
import TurndownService from "turndown";
import { marked } from "marked";

const rawTarotHtml = `<p>Pedindo proteção e me colocando humildemente como canal!</p>
<p>O Tarô é um sistema de conhecimento que foi ensinado ao longo dos tempos em escolas esotéricas e também por iniciados em transmissão e iniciações.</p>
<p>É uma sabedoria apresentada através de imagens, em que os símbolos muitas vezes se ocultam em figuras herméticas. Originalmente, o Tarô era um livro de sabedoria do deus/neter egípcio Thoth, similar a outros sistemas como o I Ching e a Cabala.</p>
<p>É composto por 22 cartas que são os Arcanos maiores e 56 cartas que são os Acanos menores. Os Arcanos maiores tem uma estreita relação com as 22 letras do alfabeto hebraico.</p>
<p>Da origem etimológica Tar Rw, Tarot, Thora, Rota, Athor, Taurt... muitas são as evidências e aqui ficaremos com a etimologia egípcia para entender esta palavra estranha, que causa fascínio nos que a pronunciam em todos os tempos.</p>
<p>Esta é, de muitas literaturas, hipótese primeira -Tar Rw, uma sentença egípcia que se refere ao "<em>caminho real</em>". Sendo Tar, caminho ou estrada, ou ainda, somente Ta, terra ou lugar; e Rw, Ru ou Ros, significando real ou realeza.</p>
<p>Ainda Tauret, a deusa/neteret egípcia da felicidade, protetora das mulheres grávidas, do nascimento e renascimento no reino dos mortos, ou Tuat. Tauret era representada com cabeça de hipopótamo e corpo de mulher.</p>
<p>As sacerdotisas que regiam os templos eram famosas por sua grande sensibilidade e intuição, assim a tendência para assuntos mágicos e oraculares.</p>
<p>Veja <a href="https://www.youtube.com/playlist?list=PLdwoOIc2voTFEugNsa2u-zlkoTqyVU9Af">no meu canal do Youtube</a>, uma conversa sobre cada um dos 22 Arcanos maiores do Tarô Egípcio.</p>`;

const rawCleopatraHtml = `<p>A Magia de Cleópatra é um conhecimento ancestral passado em um Ritual Mágico, que resgata a simplicidade e a conexão da mulher com sua força/sabedoria interior.</p>
<p>Sem a clara compreensão do poder feminino na pessoa e na sociedade, a humanidade não consegue evitar os efeitos devastadores de sua ação descontrolada, podendo com o conhecimento revelado, trilhar um momento mais humano.</p>
<p>Pessoas uma vez&nbsp;acordadas passam a auxiliar o processo de resgate, regeneração e evolução.</p>
<p>A Magia é um ritual tântrico direcionado a todas as mulheres e tem a duração de aproximadamente 3 horas.</p>
<p>Especificamente trabalhamos para&nbsp;despertar o poder feminino, eliminando os condicionamentos degenerativos. O centro de consciência, <em>Chakra Swadhisthana, </em>localizado na região pélvica,<em> v</em>em sendo mau usado por muito tempo, enfraquecendo-nos enquanto humanidade.</p>
<p>O desconhecimento do potencial de energia gerado nesta região e o uso equivocado acarretam em inúmeros problemas físicos, mentais, psicológicos e espirituais.</p>
<blockquote>
<p>Movimentos mágicos especiais, danças, segredos milenares, entendimentos, partilhas, silêncio e ritual de poder. Conhecer, restaurar, despertar a Magia de Cleópatra.</p>
</blockquote>
<p>O benefício maior para todos é que pessoas conscientes envolvem-se com suas vidas, com a Natureza e todos os seres vivos de forma mais Presente, melhorando suas ações. Assim, contagia-se o ambiente com agradável energia.</p>
<p>Organize um grupo feminino e receba esta sagrada sabedoria. <a href="mailto:contato@povoempe.com">Contato!</a></p>
<p><a href="/depoimentos">Clique aqui</a> e veja alguns depoimentos das mulheres que já participaram deste Ritual.</p>`;

function cleanHtml(html: string): string {
  let c = html;
  c = c.replace(/<!--\s*\/?wp:[^>]*-->/g, "");
  c = c.replace(/&nbsp;/g, " ");
  c = c.replace(/<p>\s*<\/p>/g, "");

  const td = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
    emDelimiter: "*",
  });
  let md = td.turndown(c);
  md = md.replace(/\n{3,}/g, "\n\n");
  return marked.parse(md.trim()) as string;
}

export async function up(db: Kysely<never>): Promise<void> {
  const tarotContent = cleanHtml(rawTarotHtml);
  const cleopatraContent = cleanHtml(rawCleopatraHtml);

  await sql`
    INSERT INTO posts (title, slug, content, excerpt, featured_image, post_type, status, published_at, wp_original_id)
    VALUES (
      'Tarô Egípcio',
      'taro-egipcio',
      ${tarotContent},
      'Os 22 Arcanos maiores do Tarô Egípcio, interpretados de forma intuitiva e vivenciados através de posturas mágicas.',
      '/uploads/2014/02/olhar-anciao.webp',
      'course',
      'published',
      '2011-02-16T15:15:58Z',
      842
    )
  `.execute(db);

  await sql`
    INSERT INTO posts (title, slug, content, excerpt, featured_image, post_type, status, published_at, wp_original_id)
    VALUES (
      'Magia de Cleópatra',
      'ritual-magia-de-cleopatra',
      ${cleopatraContent},
      'A Magia de Cleópatra é um conhecimento ancestral passado em Ritual Mágico e resgata a simplicidade e conexão da mulher com sua força/sabedoria interior.',
      '/uploads/2011/02/whats-app-image-2022-05-02-at-14-55-42.webp',
      'course',
      'published',
      '2011-02-16T15:54:26Z',
      878
    )
  `.execute(db);
}

export async function down(db: Kysely<never>): Promise<void> {
  await sql`DELETE FROM posts WHERE wp_original_id IN (842, 878)`.execute(db);
}
