import ApiEndpoints from './ApiEndpoints';
import { get, post } from './ApiClient';
import { handleAsync } from '../utils/HandleAPIResponse';

const JobsService = {
  fetchReviews: async (jobId, page = 1, pageSize = 10) => {
    const url = `${ApiEndpoints.JOB_REVIEWS(jobId)}?pageNumber=${page}&pageSize=${pageSize}`;
    return handleAsync(get(url));
  },

  submitReview: async (jobId, payload) => {
    const url = ApiEndpoints.JOB_REVIEWS(jobId);
    return handleAsync(post(url, payload));
  },
};

export default JobsService;
