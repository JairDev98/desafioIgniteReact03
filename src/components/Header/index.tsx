import Link from 'next/link';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <div className={styles.containerHeader}>
      <header className={styles.headerContainer}>
        <Link href="/">
          <img src="./images/logo.svg" alt="logo" />
        </Link>
      </header>
    </div>
  );
}
