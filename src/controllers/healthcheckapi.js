import { ApiResponse } from '../utilities/APIResponse.js';
import { asyncHandler } from '../utilities/asyncHandler.js';

const healthCheck = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, 'OK', 'success'));
});

export { healthCheck };

export default healthCheck;
