export type serverResponse = {
  server: {
    status: boolean;
    message?: string | null;
  };
};

export type validationErrorItem = {
  field: string | undefined;
  message: string;
};
