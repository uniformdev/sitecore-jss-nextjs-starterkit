import { Link, RichText, Text } from "@sitecore-jss/sitecore-jss-react";

import styles from "./Hero.module.css";

const Hero = ({ fields }) => {
  if (!fields) {
    return null;
  }

  const {
    title,
    subtitle,
    text,
    primaryCTATitle,
    primaryCTALink,
    secondaryCTATitle,
    secondaryCTALink,
  } = fields;

  return (
    <>
      <Text field={title} tag="h1" className={styles.title} />
      {subtitle && (
        <Text field={subtitle} tag="h2" className={styles.subtitle} />
      )}
      <p className={styles.description}>
        <RichText tag="span" field={text} />
      </p>
      <div>
        <Cta
          titleField={primaryCTATitle}
          linkField={primaryCTALink}
          cssClassName={styles.cta1}
        />
        <Cta
          titleField={secondaryCTATitle}
          linkField={secondaryCTALink}
          cssClassName={styles.cta2}
        />
      </div>
    </>
  );
};

const Cta = ({ titleField, linkField, cssClassName }) =>
    titleField && linkField?.value?.href ? (
        <Link field={linkField} className={cssClassName}>
            <Text field={titleField} />
        </Link>
    ) : null;

export default Hero;
