import { useCallback } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { AsyncThunkAction, unwrapResult } from '@reduxjs/toolkit';

import { RootState, AppDispatch } from '@frameworks/redux';

export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// useUnwrapAsyncThunk
export const useAppDispatchAndUnwrap = () => {
  const dispatch = useAppDispatch();
  return useCallback(
    <R extends any>(asyncThunk: AsyncThunkAction<R, any, any>): Promise<R> => dispatch(asyncThunk).then(unwrapResult),
    [dispatch]
  );
};
