import { GetStaticProps } from 'next';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import Head from 'next/head';
import ptBR from 'date-fns/locale/pt-BR';
import { format } from 'date-fns';

import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function handleNext(): Promise<void> {
    if (nextPage === null) {
      return;
    }

    const results = await fetch(`${nextPage}`);

    const postsResults = await results.json();
    setNextPage(postsResults.next_page);

    const newPosts = postsResults.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    setPosts([...posts, ...newPosts]);
  }

  return (
    <>
      <Head>
        <title>Posts | SpaceTraveling</title>
      </Head>

      <div className={styles.contentContainer}>
        {posts.map(post => (
          <main key={post.uid} className={styles.container}>
            <article>
              <h1>
                <Link href={`/post/${post.uid}`}>{post.data.title}</Link>
              </h1>
              <p>{post.data.subtitle}</p>
              <div className={commonStyles.inf}>
                <FiCalendar />
                <time>
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </time>
                <FiUser />
                <p>{post.data.author}</p>
              </div>
            </article>
          </main>
        ))}
        <h3 className={styles.paginationPosts}>
          {nextPage && (
            <button type="button" onClick={handleNext}>
              Carregar mais posts
            </button>
          )}
        </h3>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {
      pageSize: 1,
    }
  );

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results,
  };

  return {
    props: {
      postsPagination,
    },
  };
};
