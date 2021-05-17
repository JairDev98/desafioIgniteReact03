import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import Head from 'next/head';
import { RichText } from 'prismic-dom';
import ptBR from 'date-fns/locale/pt-BR';
import { format } from 'date-fns';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  // TITULO
  const titleCount = post.data.title.split(' ').length;

  // HEADING DA POSTAGEM
  const headingCount = post.data.content.map(
    content => content.heading.split(' ').length
  );

  const resultHeading = headingCount.reduce((accum, curr) => accum + curr);

  // BODY DA POSTAGEM
  const bodyCount = post.data.content.map(
    content => RichText.asText(content.body).split(' ').length
  );

  const resultBody = bodyCount.reduce((accum, curr) => accum + curr);

  const totaWord = Math.ceil((titleCount + resultHeading + resultBody) / 200);

  return (
    <>
      <Head>
        <title>{post.data.title} | spaceTraveling</title>
      </Head>
      <img
        src={post.data.banner.url}
        alt={post.data.title}
        className={styles.imageBanner}
      />
      <div className={styles.containerTitle}>
        <h1>{post.data.title}</h1>
        <div className={commonStyles.inf}>
          <FiCalendar />
          <time>
            {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
              locale: ptBR,
            })}
          </time>
          <FiUser />
          <p>{post.data.author}</p>
          <FiClock />
          <time>{totaWord} min</time>
        </div>
      </div>

      {post.data.content.map(content => {
        return (
          <main key={content.heading} className={styles.container}>
            <article className={styles.post}>
              <h2>{content.heading}</h2>
              <div
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </article>
          </main>
        );
      })}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'post'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
  const { slug } = context.params;
  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: content.body,
        };
      }),
    },
  };

  return {
    props: { post },
  };
};
