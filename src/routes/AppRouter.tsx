import { Route, Routes } from 'react-router-dom';

import { appRoutes } from './config/index';

export const AppRouter = (): JSX.Element => {
  return (
    <Routes>
      {appRoutes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}
    </Routes>
  );
};
