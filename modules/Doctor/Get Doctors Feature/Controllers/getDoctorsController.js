import Doctor from "../../../../DB/models/DoctorSchema.js";

//  getAll Doctors 
const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({ isActive: true });
        res.status(200).json({ count: doctors.length, data: doctors });
    } catch (error) {
        console.error("Error fetching doctors:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// getDoctorBySpecialty
const getDoctorBySpecialty = async (req, res) => {
    try {
        const { specialty } = req.query;
        let filter = {};

        if (specialty) {
            filter.specialty = new RegExp(`^${specialty}$`, 'i');
        }

        const doctors = await Doctor.find(filter);

        if (doctors.length === 0) {
            return res.status(404).json({ message: "No specialty found with this name" });
        }

        res.status(200).json({ count: doctors.length, data: doctors });
    } catch (error) {
        console.error("Error fetching doctors by specialty:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// getDoctorById

const getDoctorById = async (req, res) => {
    try {

        const doctor = await Doctor.findById(req.params.id);

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        res.status(200).json({ data: doctor });
    } catch (error) {
        console.error("Error fetching doctor:", error);
    }
};

// getDoctorByName
const getDoctorByName = async (req, res) => {
    try {
        const { name } = req.query;
        let filter = {};

        if (name) {
            filter.fullName = new RegExp(name, 'i');
        }

        const doctors = await Doctor.find({ ...filter, isActive: true });

        if (doctors.length === 0) {
            return res.status(404).json({ message: "No doctor found with this name" });
        }
        res.status(200).json({ count: doctors.length, data: doctors });
    } catch (error) {
        console.error("Error fetching doctors by name:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

export { getAllDoctors, getDoctorById, getDoctorBySpecialty, getDoctorByName };
