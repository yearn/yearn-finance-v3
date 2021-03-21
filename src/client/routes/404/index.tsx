import { useAppSelector } from '@hooks';

export const Page404 = () => {
  const path = useAppSelector(({ route }) => route.path);

  return (
    <div>
      <h3>
        Page <code>{path}</code> not found
      </h3>
    </div>
  );
};
