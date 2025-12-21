import { DoctorModel } from "../../DB/models/doctor.model.js";
import { PatientModel } from "../../DB/models/patient.model.js";
import { deleteImageFromCloudinary } from "../../utils/cloudinary/cloudinary.delete.js";
import { uploadToCloudinary } from "../../utils/cloudinary/cloudinary.upload.js";
import {
  ApplicationException,
  BadRequestException,
} from "../../utils/response/error.response.js";
import { successResponse } from "../../utils/response/success.response.js";

export const uploadProfilePicture = async (req, res) => {
  const { user } = req;
  const image = req.file;

  if (!image) {
    throw new BadRequestException("No image uploaded");
  }

  const { secure_url, public_id } = await uploadToCloudinary(
    image,
    `Doctor_Appointment/users/${user._id}`
  );

  if (!secure_url || !public_id) {
    throw new ApplicationException("Fail to upload image");
  }

  let model;
  switch (user.role) {
    case "doctor":
      model = DoctorModel;
      break;

    case "patient":
      model = PatientModel;
      break;

    default:
      break;
  }


  if(user.image.public_id){
    deleteImageFromCloudinary(user.image.public_id)
  }

  const updated = await model.updateOne(
    {
      _id: user._id,
    },
    {
      image: {
        url: secure_url,
        public_id,
      },
    }
  );


  if(!updated.modifiedCount){
    throw new ApplicationException("Fail to upload image");
  }



  return successResponse({
    res,
    message:"Profile picture updated success",
    data:{
        url: secure_url,
        public_id,
    }
  })
};
