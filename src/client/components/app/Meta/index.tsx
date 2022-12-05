import { Helmet } from 'react-helmet';

interface MetaProps {
  title: string;
  description: string;
  url: string;
  image: string;
}

export const Meta = ({ title, description, url, image }: MetaProps) => {
  return (
    <Helmet>
      <title>{title}</title>

      <meta name="description" content={description} />
      <meta name="theme-color" content="#000000" />
      <meta name="git-url" content="https://github.com/yearn/yearn-finance-v3" />

      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@iearnfinance" />
      <meta name="twitter:creator" content="@iearnfinance" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};
