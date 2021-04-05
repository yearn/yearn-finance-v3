import { useAppSelector } from '@hooks';

export const Page404 = () => {
  const path = useAppSelector(({ route }) => route.path);

  return (
    <div>
      <span>
        Page <code>{path}</code> not found
      </span>
    </div>
  );
};
