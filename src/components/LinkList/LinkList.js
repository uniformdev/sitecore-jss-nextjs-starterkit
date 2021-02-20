import { RichText, Text } from "@sitecore-jss/sitecore-jss-react";
import styles from "./LinkList.module.css";

const LinkList = ({ fields }) => {
  const { items } = fields || {};
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>You got it! Now what's next?</h2>
      <div className={styles.grid}>
        {items &&
          items.map((item, index) => <LinkListItem key={index} {...item} />)}
      </div>
    </div>
  );
};

const LinkListItem = ({ fields }) => (
  <a href={fields?.link?.value?.href} target="_new" className={styles.card}>
    <Text field={fields?.title} tag="h3" />
    <RichText field={fields?.description} tag="p" />
  </a>
);

export default LinkList;
