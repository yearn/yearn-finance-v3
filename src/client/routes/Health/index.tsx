import { getConfig } from '@config';

export const Health = () => {
  const { VERSION } = getConfig();
  const health = JSON.stringify(
    {
      status: 'OK',
      version: VERSION,
    },
    null,
    2
  );
  console.info(health);

  return (
    <pre>
      <code>{health}</code>
    </pre>
  );
};
