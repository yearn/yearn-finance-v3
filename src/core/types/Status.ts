export interface Status {
  loading?: boolean;
  error?: string | null;
  callArgs?: any;
}

export const initialStatus: Status = {
  loading: false,
  error: null,
};
