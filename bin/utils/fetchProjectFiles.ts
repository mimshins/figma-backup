import axios, { AxiosResponse } from "axios";

interface FileData {
  key: string;
  name: string;
  thumbnail_url: string;
  last_modified: string;
}

interface ResponseData {
  name: string;
  files: FileData[];
}

interface ResponseError {
  error: "true" | "false";
  status: number;
  message: string;
}

const fetchProjectFiles = async (
  projectId: string,
  figmaAccessToken: string
): Promise<FileData[]> => {
  const response: AxiosResponse<ResponseData | ResponseError> = await axios.get(
    `https://api.figma.com/v1/projects/${projectId}/files`,
    { headers: { "X-Figma-Token": figmaAccessToken } }
  );

  if (response.status === 400) {
    throw new Error(
      `Fetching project files failed | ${response.statusText} | ${
        (<ResponseError>response.data).message
      }`
    );
  }

  return (<ResponseData>response.data).files;
};

export default fetchProjectFiles;
