const getMetaConfig = ({ title, description, url, image }) => {
  return {
    description: { name: 'description', content: description },
    'theme-color': { name: 'theme-color', content: '#000000' },
    'git-url': { name: 'git-url', content: 'https://github.com/yearn/yearn-finance-v3' },

    'og:url': { property: 'og:url', content: url },
    'og:type': { property: 'og:type', content: 'website' },
    'og:title': { property: 'og:title', content: title },
    'og:description': { property: 'og:description', content: description },
    'og:image': { property: 'og:image', content: image },

    'twitter:card': { name: 'twitter:card', content: 'summary_large_image' },
    'twitter:site': { name: 'twitter:site', content: '@iearnfinance' },
    'twitter:creator': { name: 'twitter:creator', content: '@iearnfinance' },
    'twitter:title': { name: 'twitter:title', content: title },
    'twitter:description': { name: 'twitter:description', content: description },
    'twitter:image': { name: 'twitter:image', content: image },
  };
};

module.exports = {
  getHtmlConfig: (isVeYfiEnv) => {
    if (isVeYfiEnv) {
      const title = 'Yearn Finance | veYFI';
      return {
        title,
        meta: getMetaConfig({
          title,
          description: 'YFI evolved',
          url: 'https://vote.yearn.finance',
          image: 'https://yearn.finance/veyfi-og.png',
        }),
      };
    }

    const title = 'Yearn Finance';
    return {
      title,
      meta: getMetaConfig({
        title,
        description: 'Put your digital assets to work and receive the best risk-adjusted yields in DeFi',
        url: 'https://yearn.finance',
        image: 'https://yearn.finance/yearn-og.png',
      }),
    };
  },
};
