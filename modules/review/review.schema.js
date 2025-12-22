import joi from "joi";

export const createReviewSchema = joi.object({
  comment: joi.string().min(3).max(500).required(),
  rating: joi.number().min(1).max(5).required(),
  doctorId: joi.string().hex().length(24).required(), // ObjectId validation
});
