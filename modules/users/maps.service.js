import axios from 'axios';
import { successResponse } from '../../utils/response/success.response.js';
import { ApplicationException } from '../../utils/response/error.response.js';

export const getGeocode = async (req, res, next) => {
  const { address } = req.query;

  const response = await axios.get(
    'https://maps.googleapis.com/maps/api/geocode/json',
    {
      params: {
        address,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    }
  );

  if (!response.data) {
    throw new ApplicationException('Google Maps API error', 500);
  }

  return successResponse({
    res,
    statusCode: 200,
    message: 'Geocode retrieved successfully',
    data: response.data
  });
};
