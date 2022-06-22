export type Result<T> = Success<T> | Failure;

type Success<T> = {
  type: "success";
  data: T;
};

type ErrorInfo = {
  name: string;
  message: string;
};

type Failure = {
  type: "failure";
  err: ErrorInfo;
};
