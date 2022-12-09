export function useLoadingProgress(states: Array<boolean | undefined>): [boolean, number] {
  const loadingStates = states.filter(Boolean).length;
  const loadingProgress = states.length ? (states.length - loadingStates) / states.length : 0;
  const isLoading = !!loadingStates;

  return [isLoading, loadingProgress];
}
