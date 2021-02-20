import styles from "./Footer.module.css";

const Footer = (props) => (
  <footer className={styles.footer}>
    <a
      href="https://uniform.dev/uniform-for-sitecore?sc_camp=sitecore-jss-nextjs-starter"
      target="_blank"
      rel="noopener noreferrer"
    >
      Powered by{" "}
      <img src="/nextjs-logo.svg" alt="Next.js Logo" className={styles.logo} />{" "}
      + Sitecore JSS +{" "}
      <img src="/uniform-logo.svg" alt="Uniform Logo" className={styles.logo} />
    </a>
  </footer>
);

export default Footer;
