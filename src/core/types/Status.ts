export interface Status {
  loading?: boolean;
  error?: string | null;
}

export const initialStatus: Status = {
  loading: false,
  error: null,
};
