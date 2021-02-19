import React from 'react';
import NextLink from 'next/link';
import { Link, RichText, Text } from '@sitecore-jss/sitecore-jss-react';

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
        <div>
            <h2>
                <Text field={title} />
                <br /> <RichText field={subtitle} tag="span" className="text-red-500" />
            </h2>
            <p>
                <RichText tag="span" field={text} />
            </p>
            <div>
                {primaryCTATitle && primaryCTALink && primaryCTALink.value && primaryCTALink.value.href && (
                    <div>
                        <Link field={primaryCTALink}>
                            <Text field={primaryCTATitle} />
                        </Link>
                    </div>
                )}
                {secondaryCTATitle &&
                    secondaryCTALink &&
                    secondaryCTALink.value &&
                    secondaryCTALink.value.href && (
                        <div>
                            <Link field={secondaryCTALink}>
                                <Text field={secondaryCTATitle} />
                            </Link>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default Hero;
