import { Placeholder } from "@sitecore-jss/sitecore-jss-react";
import styles from "./MainLayout.module.css";
import Footer from "../Footer/Footer";

const MainLayout = ({ route }) => (
  <div className={styles.container}>
    <main className={styles.main}>
      <Placeholder name="uniform-jss-kit-content" rendering={route} />
    </main>
    <Footer />
  </div>
);

export default MainLayout;
