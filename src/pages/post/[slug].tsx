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
          <time>{post.first_publication_date}</time>
          <FiUser />
          <p>{post.data.author}</p>
          <FiClock />
          <time>4 min</time>
        </div>
      </div>

      {post.data.content.map(content => {
        return (
          <main key={content.heading} className={styles.container}>
            <article className={styles.post}>
              <h2>{content.heading}</h2>
              <div dangerouslySetInnerHTML={{ __html: content.body }} />
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
    Prismic.predicates.at('document.type', 'posts'),
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
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    data: {
      title: RichText.asText(response.data.title),
      banner: { url: response.data.banner.url },
      author: RichText.asText(response.data.author),
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: RichText.asHtml(content.body),
        };
      }),
    },

    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd/MM/yyyy',
      {
        locale: ptBR,
      }
    ),
  };

  return {
    props: { post },
  };
};
