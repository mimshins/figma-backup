import axios, { AxiosResponse } from "axios";

interface ProjectData {
  name: string;
  id: string;
}

interface ResponseData {
  name: string;
  projects: ProjectData[];
}

interface ResponseError {
  error: "true" | "false";
  status: number;
  message: string;
}

const fetchTeamProjects = async (
  teamId: string,
  figmaAccessToken: string
): Promise<ProjectData[]> => {
  const response: AxiosResponse<ResponseData | ResponseError> = await axios.get(
    `https://api.figma.com/v1/teams/${teamId}/projects`,
    { headers: { "X-Figma-Token": figmaAccessToken } }
  );

  if (response.status === 400) {
    throw new Error(
      `Fetching team projects failed | ${response.statusText} | ${
        (<ResponseError>response.data).message
      }`
    );
  }

  return (<ResponseData>response.data).projects;
};

export default fetchTeamProjects;
